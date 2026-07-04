import type { UssdScreen } from "@/types";
import { bairros, abrigos, zonasRisco, USSD_CODE } from "@/data/beira";
import {
  planoEvacuacao,
  nivelRiscoLabel,
  capacidadeLabel,
  bairroPorNome,
  formatarSmsPlano,
} from "@/lib/evacuation";

export type UssdState =
  | { step: "menu" }
  | { step: "resgate_bairro" }
  | { step: "resgate_confirmar_sms" }
  | { step: "zona_bairro" }
  | { step: "sms_bairro" };

export type UssdContext = {
  state: UssdState;
  bairroId?: string;
};

export function ussdInicial(): UssdContext {
  return { state: { step: "menu" } };
}

export function renderUssd(ctx: UssdContext): UssdScreen {
  switch (ctx.state.step) {
    case "menu":
      return {
        titulo: "Rota Segura MZ",
        linhas: [`Marque ${USSD_CODE}`, "Escolha uma opção:"],
        opcoes: [
          { tecla: "1", label: "Modo Resgate — encontrar abrigo" },
          { tecla: "2", label: "Estado da minha zona" },
          { tecla: "3", label: "Receber rota por SMS" },
          { tecla: "0", label: "Sair" },
        ],
      };
    case "resgate_bairro":
      return {
        titulo: "Modo Resgate",
        linhas: ["Indique o seu bairro:", ...bairros.map((b, i) => `${i + 1}. ${b.nome}`)],
        inputMode: true,
        inputPlaceholder: "Número ou nome do bairro",
      };
    case "resgate_confirmar_sms": {
      const bairro = ctx.bairroId ? bairros.find((b) => b.id === ctx.bairroId) : undefined;
      const plano = bairro
        ? planoEvacuacao(bairro.coordenadas, abrigos, zonasRisco)
        : null;
      return {
        titulo: "Abrigo encontrado",
        linhas: plano
          ? [
              `Mais próximo: ${plano.abrigo.nome}`,
              `${plano.distanciaMetros}m · ~${plano.tempoMinutos} min`,
              capacidadeLabel(plano.abrigo),
              "Enviar instruções por SMS?",
            ]
          : ["Erro ao calcular rota."],
        opcoes: [
          { tecla: "1", label: "Sim, enviar SMS" },
          { tecla: "2", label: "Não" },
        ],
      };
    }
    case "zona_bairro":
      return {
        titulo: "Estado da zona",
        linhas: ["Indique o seu bairro:", ...bairros.map((b, i) => `${i + 1}. ${b.nome}`)],
        inputMode: true,
        inputPlaceholder: "Número ou nome",
      };
    case "sms_bairro":
      return {
        titulo: "Rota por SMS",
        linhas: [
          "Sem GPS? Receba direcções por SMS.",
          "Indique o seu bairro:",
          ...bairros.map((b, i) => `${i + 1}. ${b.nome}`),
        ],
        inputMode: true,
        inputPlaceholder: "Número ou nome",
      };
    default:
      return { titulo: "Erro", linhas: ["Sessão inválida"] };
  }
}

type UssdResult = {
  ctx: UssdContext;
  screen: UssdScreen;
  smsDisparo?: string[];
  terminado?: boolean;
};

export function processarUssd(ctx: UssdContext, input: string): UssdResult {
  const trimmed = input.trim();

  if (ctx.state.step === "menu") {
    if (trimmed === "0") {
      return {
        ctx,
        screen: { titulo: "Rota Segura MZ", linhas: ["Sessão terminada. Cuide-se."] },
        terminado: true,
      };
    }
    if (trimmed === "1") {
      const next: UssdContext = { state: { step: "resgate_bairro" } };
      return { ctx: next, screen: renderUssd(next) };
    }
    if (trimmed === "2") {
      const next: UssdContext = { state: { step: "zona_bairro" } };
      return { ctx: next, screen: renderUssd(next) };
    }
    if (trimmed === "3") {
      const next: UssdContext = { state: { step: "sms_bairro" } };
      return { ctx: next, screen: renderUssd(next) };
    }
    return { ctx, screen: { titulo: "Erro", linhas: ["Opção inválida. Tente novamente."] } };
  }

  if (
    ctx.state.step === "resgate_bairro" ||
    ctx.state.step === "zona_bairro" ||
    ctx.state.step === "sms_bairro"
  ) {
    const idx = parseInt(trimmed, 10);
    const bairro =
      !isNaN(idx) && idx >= 1 && idx <= bairros.length
        ? bairros[idx - 1]
        : bairroPorNome(trimmed, bairros);

    if (!bairro) {
      return {
        ctx,
        screen: {
          titulo: "Erro",
          linhas: ["Bairro não reconhecido.", "Tente o número ou nome do bairro."],
          inputMode: true,
        },
      };
    }

    if (ctx.state.step === "zona_bairro") {
      return {
        ctx: ussdInicial(),
        screen: {
          titulo: `Zona: ${bairro.nome}`,
          linhas: [
            `Risco: ${nivelRiscoLabel(bairro.nivelRisco)}`,
            bairro.nivelRisco === "critico" || bairro.nivelRisco === "alto"
              ? "Recomendação: EVACUE agora."
              : "Mantenha-se informado.",
            "Marque *384*7# para modo resgate.",
          ],
        },
        terminado: true,
      };
    }

    if (ctx.state.step === "sms_bairro") {
      const plano = planoEvacuacao(bairro.coordenadas, abrigos, zonasRisco);
      return {
        ctx: ussdInicial(),
        screen: {
          titulo: "SMS enviado",
          linhas: [
            "Rota enviada para o seu número.",
            `Abrigo: ${plano.abrigo.nome}`,
            "Verifique o simulador SMS.",
          ],
        },
        smsDisparo: formatarSmsPlano(plano),
        terminado: true,
      };
    }

    if (ctx.state.step === "resgate_bairro") {
      const next: UssdContext = { state: { step: "resgate_confirmar_sms" }, bairroId: bairro.id };
      return { ctx: next, screen: renderUssd(next) };
    }
  }

  if (ctx.state.step === "resgate_confirmar_sms") {
    if (trimmed === "1" && ctx.bairroId) {
      const bairro = bairros.find((b) => b.id === ctx.bairroId)!;
      const plano = planoEvacuacao(bairro.coordenadas, abrigos, zonasRisco);
      return {
        ctx: ussdInicial(),
        screen: {
          titulo: "Modo Resgate activo",
          linhas: [
            "SMS com rota enviado!",
            `Destino: ${plano.abrigo.nome}`,
            "Siga as instruções por SMS.",
            "Boa sorte. Cuide-se.",
          ],
        },
        smsDisparo: formatarSmsPlano(plano),
        terminado: true,
      };
    }
    return {
      ctx: ussdInicial(),
      screen: { titulo: "Rota Segura MZ", linhas: ["Sessão terminada."] },
      terminado: true,
    };
  }

  return { ctx: ussdInicial(), screen: renderUssd(ussdInicial()) };
}
