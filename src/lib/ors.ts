import type { FloodZone } from "@/types";

const ORS_BASE = "https://api.openrouteservice.org/v2/directions";

type OrsRouteResult = {
  coordinates: [number, number][];
  distanciaMetros: number;
  duracaoSegundos: number;
};

function zonasParaMultiPolygon(zonas: FloodZone[]) {
  return {
    type: "MultiPolygon" as const,
    coordinates: zonas.map((z) => z.coordinates),
  };
}

/** Simplifica a geometria ORS para poucos waypoints (SMS / instruções) */
function simplificarCoordenadas(
  coords: [number, number][],
  maxPontos = 8
): [number, number][] {
  if (coords.length <= maxPontos) return coords;
  const passo = Math.floor(coords.length / (maxPontos - 1));
  const resultado: [number, number][] = [coords[0]];
  for (let i = passo; i < coords.length - 1; i += passo) {
    resultado.push(coords[i]);
  }
  resultado.push(coords[coords.length - 1]);
  return resultado;
}

export async function obterRotaOrs(
  origem: [number, number],
  destino: [number, number],
  zonas: FloodZone[]
): Promise<OrsRouteResult | null> {
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) return null;

  const body: Record<string, unknown> = {
    coordinates: [origem, destino],
  };

  if (zonas.length > 0) {
    body.options = { avoid_polygons: zonasParaMultiPolygon(zonas) };
  }

  try {
    const res = await fetch(`${ORS_BASE}/foot-walking/geojson`, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
        Accept: "application/json, application/geo+json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("ORS error:", res.status, err);
      return null;
    }

    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature?.geometry?.coordinates) return null;

    const rawCoords = feature.geometry.coordinates as [number, number][];
    const props = feature.properties ?? {};
    const summary = props.summary ?? props.segments?.[0]?.distance
      ? {
          distance: props.segments.reduce(
            (a: number, s: { distance?: number }) => a + (s.distance ?? 0),
            0
          ),
          duration: props.segments.reduce(
            (a: number, s: { duration?: number }) => a + (s.duration ?? 0),
            0
          ),
        }
      : { distance: 0, duration: 0 };

    return {
      coordinates: simplificarCoordenadas(rawCoords),
      distanciaMetros: Math.round(summary.distance ?? props.summary?.distance ?? 0),
      duracaoSegundos: Math.round(summary.duration ?? props.summary?.duration ?? 0),
    };
  } catch (e) {
    console.error("ORS fetch failed:", e);
    return null;
  }
}
