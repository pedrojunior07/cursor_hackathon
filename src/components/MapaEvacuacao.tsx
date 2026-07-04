"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { BEIRA_CENTER, zonasRisco } from "@/data/beira";
import { capacidadeLabel } from "@/lib/evacuation";
import { obterPlanoEvacuacao, type PlanoComFonte } from "@/lib/rota-client";
import { useAbrigos } from "@/lib/use-abrigos";
import type { EvacuationPlan, Shelter } from "@/types";

type Props = {
  onPlano?: (plano: EvacuationPlan) => void;
  /** ID de abrigo pré-seleccionado (vindo da tela de detalhe) */
  abrigoAlvoId?: string;
};

export function MapaEvacuacao({ onPlano, abrigoAlvoId }: Props) {
  const { abrigos } = useAbrigos();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const abrigosRef = useRef<Shelter[]>(abrigos);
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
          features: abrigosRef.current.map((a) => ({
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

  useEffect(() => {
    abrigosRef.current = abrigos;
    const map = mapRef.current;
    const source = map?.getSource("abrigos") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData({
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
    });
  }, [abrigos]);

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

  const calcularRota = useCallback(async () => {
    const origem = posicao ?? BEIRA_CENTER;
    if (!posicao) setPosicao(origem);
    marcarPosicao(origem);
    setACalcularRota(true);
    setErroRota(null);
    try {
      const p = await obterPlanoEvacuacao(origem, abrigoAlvoId);
      setPlano(p);
      onPlano?.(p);
      desenharRota(p.rotaCoordenadas);
    } catch {
      setErroRota("Não foi possível calcular a rota. Tente novamente.");
    } finally {
      setACalcularRota(false);
    }
  }, [posicao, abrigoAlvoId, marcarPosicao, onPlano, desenharRota]);

  useEffect(() => {
    if (!abrigoAlvoId || aCarregar) return;
    calcularRota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abrigoAlvoId, aCarregar]);

  const abrigoAlvo = abrigoAlvoId ? abrigos.find((a) => a.id === abrigoAlvoId) : undefined;

  return (
    <div className="relative flex h-full flex-col">
      <div ref={containerRef} className="min-h-[50vh] flex-1" />

      {aCarregar && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/90">
          <p className="text-body-md font-sans text-on-surface-variant">A carregar mapa…</p>
        </div>
      )}

      <div className="space-y-3 border-t-2 border-outline-variant bg-surface p-gutter-mobile">
        {abrigoAlvo && (
          <div className="flex items-center gap-2 border-2 border-outline-variant bg-surface-container px-3 py-2 text-label-lg font-sans">
            <span className="material-symbols-outlined text-secondary text-[18px]">place</span>
            Destino escolhido: <strong>{abrigoAlvo.nome}</strong>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={obterGps}
            className="flex h-touch-target-min flex-1 items-center justify-center gap-2 bg-secondary text-button-text font-sans text-on-secondary transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">my_location</span>
            A minha posição
          </button>
          <button
            type="button"
            onClick={() => calcularRota()}
            disabled={aCalcularRota}
            className="flex h-touch-target-min flex-1 items-center justify-center gap-2 bg-primary text-button-text font-sans text-on-primary transition-transform active:scale-95 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[20px]">directions_run</span>
            {aCalcularRota ? "A calcular…" : "Rota segura"}
          </button>
        </div>

        {erroGps && <p className="text-label-lg font-sans text-error">{erroGps}</p>}
        {erroRota && <p className="text-label-lg font-sans text-error">{erroRota}</p>}

        {plano && (
          <div className="border-2 border-outline-variant bg-surface-container-low p-3">
            <div className="flex items-center justify-between">
              <p className="text-label-lg font-sans font-bold text-green-700">Abrigo recomendado</p>
              {plano.fonte === "ors" && (
                <span className="rounded bg-secondary-container px-2 py-0.5 text-[10px] text-on-secondary-container">
                  ORS · evita inundações
                </span>
              )}
            </div>
            <p className="mt-1 text-body-md font-sans font-medium">{plano.abrigo.nome}</p>
            <p className="text-body-md font-sans text-on-surface-variant">{plano.abrigo.bairro}</p>
            <p className="mt-2 text-body-md font-sans text-on-surface-variant">
              {plano.distanciaMetros} m · ~{plano.tempoMinutos} min a pé
            </p>
            <p className="text-body-md font-sans text-on-surface-variant">{capacidadeLabel(plano.abrigo)}</p>
            <ul className="mt-2 space-y-1 border-t border-outline-variant pt-2 text-label-lg font-sans text-on-surface-variant">
              {plano.passos.map((s, i) => (
                <li key={i}>
                  {i + 1}. {s.instrucao}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-label-lg font-sans text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-error" /> Inundação
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
