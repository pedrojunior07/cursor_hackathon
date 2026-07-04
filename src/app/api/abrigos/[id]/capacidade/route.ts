import { NextRequest, NextResponse } from "next/server";
import { atualizarCapacidadeDb } from "@/lib/abrigos-repo";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: { pin?: string; delta?: number; marcarCheio?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido" }, { status: 400 });
  }

  const pinEsperado = process.env.STAFF_PIN;
  if (!pinEsperado || body.pin !== pinEsperado) {
    return NextResponse.json({ erro: "PIN incorrecto" }, { status: 401 });
  }

  const mudanca = body.marcarCheio
    ? ({ tipo: "marcar_cheio" } as const)
    : ({ tipo: "delta" as const, delta: typeof body.delta === "number" ? body.delta : 0 });

  const atualizado = await atualizarCapacidadeDb(id, mudanca);
  if (!atualizado) {
    return NextResponse.json(
      { erro: "Abrigo não encontrado ou base de dados indisponível" },
      { status: 404 }
    );
  }

  return NextResponse.json({ abrigo: atualizado });
}
