import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export type IntentoResultado = {
  bairroId: string | null;
  comando: "abrigo" | "zona" | "sms" | "ajuda" | "desconhecido";
};

/**
 * Interpreta texto livre (USSD/SMS) escrito por um utilizador em pânico durante uma
 * inundação, mapeando-o para um bairro conhecido e uma intenção. Usado apenas como
 * fallback quando a correspondência exacta/aproximada por nome/número falha.
 */
export async function interpretarPedido(
  texto: string,
  bairrosDisponiveis: { id: string; nome: string }[]
): Promise<IntentoResultado | null> {
  const openai = getClient();
  if (!openai) return null;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Interpretas mensagens curtas em português de Moçambique, escritas via SMS ou USSD " +
            "por pessoas em risco durante uma inundação, num sistema de evacuação de emergência. " +
            "Identifica APENAS o id de um bairro da lista fornecida (ou string vazia se não tiveres " +
            "confiança) e a intenção do pedido.",
        },
        {
          role: "user",
          content: `Bairros válidos:\n${bairrosDisponiveis.map((b) => `${b.id} = ${b.nome}`).join("\n")}\n\nMensagem do utilizador: "${texto}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "intento",
          strict: true,
          schema: {
            type: "object",
            properties: {
              bairroId: {
                type: "string",
                description: "id do bairro identificado, ou string vazia se incerto",
              },
              comando: {
                type: "string",
                enum: ["abrigo", "zona", "sms", "ajuda", "desconhecido"],
              },
            },
            required: ["bairroId", "comando"],
            additionalProperties: false,
          },
        },
      },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { bairroId: string; comando: IntentoResultado["comando"] };

    const bairroValido = bairrosDisponiveis.some((b) => b.id === parsed.bairroId);
    return { bairroId: bairroValido ? parsed.bairroId : null, comando: parsed.comando };
  } catch (e) {
    console.error("interpretarPedido falhou:", e);
    return null;
  }
}
