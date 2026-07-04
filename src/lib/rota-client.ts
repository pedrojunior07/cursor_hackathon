import type { EvacuationPlan } from "@/types";

export type PlanoComFonte = EvacuationPlan & { fonte?: "ors" | "local" };

export async function obterPlanoEvacuacao(
  origem: [number, number],
  abrigoId?: string
): Promise<PlanoComFonte> {
  try {
    const res = await fetch("/api/rota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origem, abrigoId }),
    });
    if (res.ok) return res.json();
  } catch {
    /* fallback abaixo */
  }

  const { planoEvacuacaoLocal, planoParaAbrigo } = await import("@/lib/evacuation");
  const { abrigos, zonasRisco } = await import("@/data/beira");
  const abrigoAlvo = abrigoId ? abrigos.find((a) => a.id === abrigoId) : undefined;
  const plano = abrigoAlvo
    ? planoParaAbrigo(origem, abrigoAlvo, zonasRisco)
    : planoEvacuacaoLocal(origem, abrigos, zonasRisco);
  return { ...plano, fonte: "local" };
}
