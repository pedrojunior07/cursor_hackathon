import { NextRequest, NextResponse } from "next/server";
import { bairros } from "@/data/beira";
import { interpretarPedido } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { texto } = (await req.json()) as { texto?: string };
    if (!texto || typeof texto !== "string") {
      return NextResponse.json({ erro: "texto inválido" }, { status: 400 });
    }

    const resultado = await interpretarPedido(
      texto,
      bairros.map((b) => ({ id: b.id, nome: b.nome }))
    );

    if (!resultado) {
      return NextResponse.json({ erro: "IA indisponível" }, { status: 503 });
    }

    return NextResponse.json(resultado);
  } catch {
    return NextResponse.json({ erro: "Falha ao interpretar pedido" }, { status: 500 });
  }
}
