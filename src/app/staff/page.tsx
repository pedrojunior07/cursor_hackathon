"use client";

import { useState } from "react";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { Nav } from "@/components/Nav";
import { CapacityBar } from "@/components/CapacityBar";
import { useAbrigos } from "@/lib/use-abrigos";
import { pctOcupado, statusAbrigo, STATUS_LABEL } from "@/lib/evacuation";
import { tempoRelativo } from "@/lib/tempo";

function LoginPin({ onEntrar }: { onEntrar: (pin: string) => void }) {
  const [pin, setPin] = useState("");

  const digitar = (d: string) => {
    if (pin.length >= 4) return;
    const novoPin = pin + d;
    setPin(novoPin);
    if (novoPin.length === 4) onEntrar(novoPin);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-stack-lg px-gutter-mobile">
      <span className="material-symbols-outlined text-[48px] text-primary">shield_person</span>
      <h2 className="text-headline-md font-sans text-on-surface">Modo Staff</h2>
      <p className="text-body-md font-sans text-on-surface-variant">Introduza o PIN de 4 dígitos</p>
      <div className="flex gap-3">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 border-outline ${
              i < pin.length ? "bg-primary" : "bg-transparent"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((d, i) =>
          d === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => (d === "⌫" ? setPin((p) => p.slice(0, -1)) : digitar(d))}
              className="flex h-touch-target-min w-touch-target-min items-center justify-center border-2 border-outline-variant bg-surface-container text-headline-md font-sans text-on-surface active:scale-95"
            >
              {d}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default function PaginaStaff() {
  const [pin, setPin] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aActualizar, setAActualizar] = useState<string | null>(null);
  const { abrigos, recarregar } = useAbrigos(10000);

  const actualizarCapacidade = async (
    id: string,
    corpo: { delta?: number; marcarCheio?: boolean }
  ) => {
    if (!pin) return;
    setAActualizar(id);
    setErro(null);
    try {
      const res = await fetch(`/api/abrigos/${id}/capacidade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, ...corpo }),
      });
      if (res.status === 401) {
        setPin(null);
        setErro("PIN incorrecto. Introduza novamente.");
        return;
      }
      if (!res.ok) {
        setErro("Não foi possível actualizar. Tente novamente.");
        return;
      }
      await recarregar();
    } catch {
      setErro("Sem ligação. Tente novamente.");
    } finally {
      setAActualizar(null);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-24 pt-touch-target-min">
      <TopAppBar title="MODO STAFF" backHref="/" />
      {!pin ? (
        <LoginPin onEntrar={setPin} />
      ) : (
        <main className="flex flex-col gap-stack-md px-gutter-mobile py-stack-md">
          <h2 className="text-headline-md font-sans text-on-surface">Abrigos atribuídos</h2>
          {erro && <p className="text-label-lg font-sans text-error">{erro}</p>}
          <div className="flex flex-col gap-stack-md pb-8">
            {abrigos.map((abrigo) => {
              const status = statusAbrigo(abrigo);
              return (
                <article key={abrigo.id} className="flex flex-col gap-3 border-2 border-outline bg-surface p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-headline-md font-sans leading-none">{abrigo.nome}</h3>
                      <p className="mt-1 text-body-md font-sans text-on-surface-variant">
                        {abrigo.bairro} ·{" "}
                        {abrigo.actualizadoEm ? `Actualizado ${tempoRelativo(abrigo.actualizadoEm)}` : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-label-lg font-sans">
                    <span>
                      {abrigo.ocupado}/{abrigo.capacidadeTotal} ({pctOcupado(abrigo)}%)
                    </span>
                    <span className="font-bold">{STATUS_LABEL[status]}</span>
                  </div>
                  <CapacityBar abrigo={abrigo} size="lg" />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={aActualizar === abrigo.id}
                      onClick={() => actualizarCapacidade(abrigo.id, { delta: -5 })}
                      className="flex h-touch-target-min flex-1 items-center justify-center gap-1 bg-secondary text-button-text font-sans text-on-secondary active:scale-95 disabled:opacity-60"
                    >
                      -5 pessoas
                    </button>
                    <button
                      type="button"
                      disabled={aActualizar === abrigo.id}
                      onClick={() => actualizarCapacidade(abrigo.id, { delta: 5 })}
                      className="flex h-touch-target-min flex-1 items-center justify-center gap-1 bg-secondary text-button-text font-sans text-on-secondary active:scale-95 disabled:opacity-60"
                    >
                      +5 pessoas
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={aActualizar === abrigo.id}
                    onClick={() => actualizarCapacidade(abrigo.id, { marcarCheio: true })}
                    className="flex h-touch-target-min w-full items-center justify-center gap-2 bg-error text-button-text font-sans text-on-error active:scale-95 disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[20px]">block</span>
                    Marcar cheio
                  </button>
                </article>
              );
            })}
          </div>
        </main>
      )}
      <Nav />
    </div>
  );
}
