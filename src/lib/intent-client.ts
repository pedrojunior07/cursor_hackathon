import type { IntentoResultado } from "@/lib/ai";

/** Chama /api/intent; devolve null em qualquer falha (sem rede, IA indisponível, etc). */
export async function interpretarPedidoCliente(texto: string): Promise<IntentoResultado | null> {
  try {
    const res = await fetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
    });
    if (!res.ok) return null;
    return (await res.json()) as IntentoResultado;
  } catch {
    return null;
  }
}
