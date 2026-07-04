import type { EvacuationPlan } from "@/types";

export type PlanoComFonte = EvacuationPlan & { fonte?: "ors" | "local" };

export async function obterPlanoEvacuacao(
  origem: [number, number]
): Promise<PlanoComFonte> {
  try {
    const res = await fetch("/api/rota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origem }),
    });
    if (res.ok) return res.json();
  } catch {
    /* fallback abaixo */
  }

  const { planoEvacuacaoLocal } = await import("@/lib/evacuation");
  const { abrigos, zonasRisco } = await import("@/data/beira");
  return { ...planoEvacuacaoLocal(origem, abrigos, zonasRisco), fonte: "local" };
}
