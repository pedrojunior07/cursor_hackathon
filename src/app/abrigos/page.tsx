"use client";

import { useEffect, useMemo, useState } from "react";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { Nav } from "@/components/Nav";
import { ShelterCard } from "@/components/ShelterCard";
import { bairros, BEIRA_CENTER } from "@/data/beira";
import { distanciaMetros, statusAbrigo } from "@/lib/evacuation";
import { useAbrigos } from "@/lib/use-abrigos";

export default function PaginaListaAbrigos() {
  const { abrigos } = useAbrigos();
  const [posicao, setPosicao] = useState<[number, number]>(BEIRA_CENTER);
  const [somenteComVaga, setSomenteComVaga] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosicao([pos.coords.longitude, pos.coords.latitude]),
      () => {
        /* mantém fallback no centro da Beira */
      }
    );
  }, []);

  const bairroCritico = bairros.find((b) => b.nivelRisco === "critico");

  const ordenados = useMemo(
    () =>
      [...abrigos]
        .map((a) => ({ abrigo: a, distanciaKm: distanciaMetros(posicao, a.coordenadas) / 1000 }))
        .sort((a, b) => a.distanciaKm - b.distanciaKm),
    [posicao]
  );

  const visiveis = somenteComVaga
    ? ordenados.filter(({ abrigo }) => statusAbrigo(abrigo) !== "cheio")
    : ordenados;

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-24 pt-touch-target-min">
      <TopAppBar />
      <main className="flex flex-col gap-stack-md px-gutter-mobile">
        {bairroCritico && (
          <div className="mt-4 animate-pulse border-2 border-on-error-container bg-error p-4 text-on-error">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined fill-icon text-[24px]">priority_high</span>
              <div>
                <h2 className="text-headline-md font-sans leading-tight">ALERTA CRÍTICO</h2>
                <p className="text-body-md font-sans opacity-90">
                  Bairro {bairroCritico.nome} em risco elevado. Dirija-se ao abrigo mais próximo
                  imediatamente.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-stack-sm pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-md font-sans text-on-surface-variant">
              Abrigos Disponíveis
            </h3>
            <span className="rounded bg-surface-container-highest px-2 py-1 text-label-lg font-sans text-on-surface">
              {visiveis.length} locais próximos
            </span>
          </div>
          <label className="flex cursor-pointer items-center gap-3 border-2 border-outline-variant bg-surface-container p-3 transition-transform active:scale-[0.98]">
            <input
              type="checkbox"
              checked={somenteComVaga}
              onChange={(e) => setSomenteComVaga(e.target.checked)}
              className="h-6 w-6 rounded-sm border-outline-variant text-primary focus:ring-primary"
            />
            <span className="select-none text-button-text font-sans">Mostrar apenas com vaga</span>
          </label>
        </div>

        <div className="flex flex-col gap-stack-md pb-8">
          {visiveis.map(({ abrigo, distanciaKm }) => (
            <ShelterCard key={abrigo.id} abrigo={abrigo} distanciaKm={distanciaKm} />
          ))}
        </div>
      </main>
      <Nav />
    </div>
  );
}
