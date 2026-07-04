import type { Shelter, Bairro, FloodZone, RouteStep, EvacuationPlan } from "@/types";

const EARTH_RADIUS_M = 6_371_000;

export function distanciaMetros(
  a: [number, number],
  b: [number, number]
): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function bearing(
  from: [number, number],
  to: [number, number]
): RouteStep["direcao"] {
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLng);
  const deg = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

  if (deg >= 337.5 || deg < 22.5) return "norte";
  if (deg < 67.5) return "nordeste";
  if (deg < 112.5) return "este";
  if (deg < 157.5) return "sudeste";
  if (deg < 202.5) return "sul";
  if (deg < 247.5) return "sudoeste";
  if (deg < 292.5) return "oeste";
  return "noroeste";
}

const DIRECAO_PT: Record<RouteStep["direcao"], string> = {
  norte: "norte",
  sul: "sul",
  este: "este",
  oeste: "oeste",
  nordeste: "nordeste",
  noroeste: "noroeste",
  sudeste: "sudeste",
  sudoeste: "sudoeste",
};

function pontoEmZona(
  ponto: [number, number],
  zona: FloodZone
): boolean {
  const [x, y] = ponto;
  const ring = zona.coordinates[0];
  let dentro = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      dentro = !dentro;
    }
  }
  return dentro;
}

/** Desvia o ponto médio se a linha directa cruza zona inundável */
function waypointSeguro(
  origem: [number, number],
  destino: [number, number],
  zonas: FloodZone[]
): [number, number][] {
  const coords: [number, number][] = [origem];
  const meio: [number, number] = [
    (origem[0] + destino[0]) / 2,
    (origem[1] + destino[1]) / 2,
  ];

  const zonaCruzada = zonas.find(
    (z) =>
      pontoEmZona(meio, z) ||
      pontoEmZona(origem, z) ||
      pontoEmZona(destino, z)
  );

  if (zonaCruzada) {
    const centroZona = zonaCruzada.coordinates[0].reduce(
      (acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat] as [number, number],
      [0, 0] as [number, number]
    );
    const n = zonaCruzada.coordinates[0].length;
    const centro: [number, number] = [centroZona[0] / n, centroZona[1] / n];
    const desvio: [number, number] = [
      meio[0] + (meio[0] - centro[0]) * 0.8,
      meio[1] + (meio[1] - centro[1]) * 0.8,
    ];
    coords.push(desvio);
  }

  coords.push(destino);
  return coords;
}

function gerarPassos(rota: [number, number][]): RouteStep[] {
  const passos: RouteStep[] = [];
  for (let i = 0; i < rota.length - 1; i++) {
    const de = rota[i];
    const para = rota[i + 1];
    const dist = distanciaMetros(de, para);
    const dir = bearing(de, para);
    const ultimo = i === rota.length - 2;
    passos.push({
      direcao: dir,
      distanciaMetros: Math.round(dist),
      instrucao: ultimo
        ? `Chegou ao abrigo. Siga ${Math.round(dist)}m para ${DIRECAO_PT[dir]} até à entrada.`
        : `Siga ${Math.round(dist)}m para ${DIRECAO_PT[dir]}. Evite zonas alagadas.`,
    });
  }
  return passos;
}

/** Exportado para uso com geometria ORS */
export function gerarPassosDeCoordenadas(rota: [number, number][]): RouteStep[] {
  return gerarPassos(rota);
}

export function abrigoMaisProximo(
  posicao: [number, number],
  abrigos: Shelter[]
): Shelter {
  return [...abrigos].sort(
    (a, b) =>
      distanciaMetros(posicao, a.coordenadas) -
      distanciaMetros(posicao, b.coordenadas)
  )[0];
}

export function abrigosComVagas(abrigos: Shelter[]): Shelter[] {
  return abrigos.filter((a) => a.ocupado < a.capacidadeTotal);
}

export function planoEvacuacaoLocal(
  origem: [number, number],
  abrigos: Shelter[],
  zonas: FloodZone[]
): EvacuationPlan {
  const comVagas = abrigosComVagas(abrigos);
  const lista = comVagas.length > 0 ? comVagas : abrigos;
  const abrigo = abrigoMaisProximo(origem, lista);
  const rotaCoordenadas = waypointSeguro(origem, abrigo.coordenadas, zonas);
  const distTotal = rotaCoordenadas.reduce(
    (acc, _, i) =>
      i < rotaCoordenadas.length - 1
        ? acc + distanciaMetros(rotaCoordenadas[i], rotaCoordenadas[i + 1])
        : acc,
    0
  );

  return {
    abrigo,
    distanciaMetros: Math.round(distTotal),
    tempoMinutos: Math.max(1, Math.round(distTotal / 80)),
    passos: gerarPassos(rotaCoordenadas),
    rotaCoordenadas,
  };
}

/** Alias síncrono (USSD/SMS offline) — usa desvio local simples */
export const planoEvacuacao = planoEvacuacaoLocal;

export function bairroPorNome(
  nome: string,
  lista: Bairro[]
): Bairro | undefined {
  const n = nome.trim().toLowerCase();
  return lista.find(
    (b) =>
      b.nome.toLowerCase() === n ||
      b.nome.toLowerCase().includes(n) ||
      n.includes(b.nome.toLowerCase())
  );
}

export function nivelRiscoLabel(nivel: Bairro["nivelRisco"]): string {
  const map: Record<Bairro["nivelRisco"], string> = {
    baixo: "BAIXO — zona segura",
    medio: "MÉDIO — mantenha-se alerta",
    alto: "ALTO — prepare evacuação",
    critico: "CRÍTICO — evacue agora",
  };
  return map[nivel];
}

export function capacidadeLabel(abrigo: Shelter): string {
  const livres = abrigo.capacidadeTotal - abrigo.ocupado;
  const pct = Math.round((abrigo.ocupado / abrigo.capacidadeTotal) * 100);
  return `${livres} vagas (${pct}% ocupado)`;
}

export function formatarSmsPlano(plano: EvacuationPlan): string[] {
  const { abrigo, distanciaMetros, tempoMinutos } = plano;
  const msgs: string[] = [
    `ROTA SEGURA MZ: Abrigo "${abrigo.nome}" (${abrigo.bairro}). ${distanciaMetros}m, ~${tempoMinutos} min a pé. Vagas: ${capacidadeLabel(abrigo)}.`,
    `Envie PROXIMO para instruções passo-a-passo. Envie AJUDA para falar com resgate.`,
  ];
  return msgs;
}

export function formatarSmsPasso(passo: RouteStep, indice: number, total: number): string {
  return `(${indice + 1}/${total}) ${passo.instrucao} Envie PROXIMO para continuar.`;
}
