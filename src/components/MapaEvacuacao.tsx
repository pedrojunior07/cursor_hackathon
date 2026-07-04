"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { BEIRA_CENTER, abrigos, zonasRisco } from "@/data/beira";
import { capacidadeLabel } from "@/lib/evacuation";
import { obterPlanoEvacuacao, type PlanoComFonte } from "@/lib/rota-client";
import type { EvacuationPlan } from "@/types";

type Props = {
  onPlano?: (plano: EvacuationPlan) => void;
};

export function MapaEvacuacao({ onPlano }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [posicao, setPosicao] = useState<[number, number] | null>(null);
  const [plano, setPlano] = useState<PlanoComFonte | null>(null);
  const [aCarregar, setACarregar] = useState(true);
  const [aCalcularRota, setACalcularRota] = useState(false);
  const [erroGps, setErroGps] = useState<string | null>(null);
  const [erroRota, setErroRota] = useState<string | null>(null);

  const desenharRota = useCallback((coords: [number, number][]) => {
    const map = mapRef.current;
    if (!map || coords.length < 2) return;

    const geojson = {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {},
          geometry: { type: "LineString" as const, coordinates: coords },
        },
      ],
    };

    if (map.getSource("rota")) {
      (map.getSource("rota") as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource("rota", { type: "geojson", data: geojson });
      map.addLayer({
        id: "rota-linha",
        type: "line",
        source: "rota",
        paint: { "line-color": "#22c55e", "line-width": 5 },
        layout: { "line-cap": "round", "line-join": "round" },
      });
    }

    const bounds = coords.reduce(
      (b, c) => b.extend(c as [number, number]),
      new maplibregl.LngLatBounds(coords[0], coords[0])
    );
    map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
  }, []);

  const marcarPosicao = useCallback((coords: [number, number]) => {
    const map = mapRef.current;
    if (!map) return;

    const geojson = {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {},
          geometry: { type: "Point" as const, coordinates: coords },
        },
      ],
    };

    if (map.getSource("utilizador")) {
      (map.getSource("utilizador") as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource("utilizador", { type: "geojson", data: geojson });
      map.addLayer({
        id: "utilizador-ponto",
        type: "circle",
        source: "utilizador",
        paint: {
          "circle-radius": 8,
          "circle-color": "#3b82f6",
          "circle-stroke-width": 3,
          "circle-stroke-color": "#fff",
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: BEIRA_CENTER,
      zoom: 13,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("zonas-risco", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: zonasRisco.map((z) => ({
            type: "Feature",
            properties: { nome: z.nome, nivel: z.nivel },
            geometry: { type: "Polygon", coordinates: z.coordinates },
          })),
        },
      });

      map.addLayer({
        id: "zonas-fill",
        type: "fill",
        source: "zonas-risco",
        paint: {
          "fill-color": [
            "match",
            ["get", "nivel"],
            "inundacao",
            "#dc2626",
            "alerta",
            "#ea580c",
            "#94a3b8",
          ],
          "fill-opacity": 0.45,
        },
      });

      map.addLayer({
        id: "zonas-linha",
        type: "line",
        source: "zonas-risco",
        paint: { "line-color": "#fef2f2", "line-width": 2 },
      });

      map.addSource("abrigos", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: abrigos.map((a) => ({
            type: "Feature",
            properties: {
              nome: a.nome,
              bairro: a.bairro,
              vagas: a.capacidadeTotal - a.ocupado,
            },
            geometry: { type: "Point", coordinates: a.coordenadas },
          })),
        },
      });

      map.addLayer({
        id: "abrigos-circulo",
        type: "circle",
        source: "abrigos",
        paint: {
          "circle-radius": 10,
          "circle-color": [
            "case",
            [">", ["get", "vagas"], 50],
            "#16a34a",
            [">", ["get", "vagas"], 10],
            "#eab308",
            "#dc2626",
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      setACarregar(false);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const obterGps = () => {
    setErroGps(null);
    if (!navigator.geolocation) {
      setErroGps("GPS não disponível neste dispositivo.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setPosicao(coords);
        marcarPosicao(coords);
        mapRef.current?.flyTo({ center: coords, zoom: 14 });
      },
      () => setErroGps("Não foi possível obter localização. Use USSD/SMS sem GPS.")
    );
  };

  const calcularRota = async () => {
    const origem = posicao ?? BEIRA_CENTER;
    if (!posicao) setPosicao(origem);
    marcarPosicao(origem);
    setACalcularRota(true);
    setErroRota(null);
    try {
      const p = await obterPlanoEvacuacao(origem);
      setPlano(p);
      onPlano?.(p);
      desenharRota(p.rotaCoordenadas);
    } catch {
      setErroRota("Não foi possível calcular a rota. Tente novamente.");
    } finally {
      setACalcularRota(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col">
      <div ref={containerRef} className="min-h-[50vh] flex-1" />

      {aCarregar && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
          <p className="text-sm text-slate-300">A carregar mapa…</p>
        </div>
      )}

      <div className="space-y-3 border-t border-slate-700 bg-slate-900 p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={obterGps}
            className="flex-1 rounded-lg bg-sky-600 px-3 py-3 text-sm font-semibold text-white active:bg-sky-700"
          >
            📍 A minha posição
          </button>
          <button
            type="button"
            onClick={calcularRota}
            disabled={aCalcularRota}
            className="flex-1 rounded-lg bg-emerald-600 px-3 py-3 text-sm font-semibold text-white active:bg-emerald-700 disabled:opacity-60"
          >
            {aCalcularRota ? "A calcular…" : "🛡️ Rota segura"}
          </button>
        </div>

        {erroGps && <p className="text-xs text-red-400">{erroGps}</p>}
        {erroRota && <p className="text-xs text-red-400">{erroRota}</p>}

        {plano && (
          <div className="rounded-lg border border-slate-600 bg-slate-800 p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-emerald-400">Abrigo recomendado</p>
              {plano.fonte === "ors" && (
                <span className="rounded bg-sky-900 px-2 py-0.5 text-[10px] text-sky-300">
                  ORS · evita inundações
                </span>
              )}
            </div>
            <p className="mt-1 font-medium">{plano.abrigo.nome}</p>
            <p className="text-slate-400">{plano.abrigo.bairro}</p>
            <p className="mt-2 text-slate-300">
              {plano.distanciaMetros} m · ~{plano.tempoMinutos} min a pé
            </p>
            <p className="text-slate-400">{capacidadeLabel(plano.abrigo)}</p>
            <ul className="mt-2 space-y-1 border-t border-slate-600 pt-2 text-xs text-slate-300">
              {plano.passos.map((s, i) => (
                <li key={i}>
                  {i + 1}. {s.instrucao}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-red-600" /> Inundação
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-orange-500" /> Alerta
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-green-600" /> Abrigo c/ vagas
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500" /> Rota segura
          </span>
        </div>
      </div>
    </div>
  );
}
