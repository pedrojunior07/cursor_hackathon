import { NextRequest, NextResponse } from "next/server";
import { abrigos, zonasRisco } from "@/data/beira";
import {
  planoEvacuacaoLocal,
  abrigoMaisProximo,
  abrigosComVagas,
  gerarPassosDeCoordenadas,
} from "@/lib/evacuation";
import { obterRotaOrs } from "@/lib/ors";

export async function POST(req: NextRequest) {
  try {
    const { origem } = (await req.json()) as { origem: [number, number] };

    if (
      !origem ||
      origem.length !== 2 ||
      typeof origem[0] !== "number" ||
      typeof origem[1] !== "number"
    ) {
      return NextResponse.json({ erro: "Origem inválida" }, { status: 400 });
    }

    const comVagas = abrigosComVagas(abrigos);
    const lista = comVagas.length > 0 ? comVagas : abrigos;
    const abrigo = abrigoMaisProximo(origem, lista);

    const rotaOrs = await obterRotaOrs(origem, abrigo.coordenadas, zonasRisco);

    if (rotaOrs) {
      const plano = {
        abrigo,
        distanciaMetros: rotaOrs.distanciaMetros,
        tempoMinutos: Math.max(1, Math.round(rotaOrs.duracaoSegundos / 60)),
        passos: gerarPassosDeCoordenadas(rotaOrs.coordinates),
        rotaCoordenadas: rotaOrs.coordinates,
        fonte: "ors" as const,
      };
      return NextResponse.json(plano);
    }

    const planoLocal = planoEvacuacaoLocal(origem, abrigos, zonasRisco);
    return NextResponse.json({ ...planoLocal, fonte: "local" as const });
  } catch {
    return NextResponse.json({ erro: "Falha ao calcular rota" }, { status: 500 });
  }
}
