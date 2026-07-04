"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { Nav } from "@/components/Nav";
import { CapacityBar } from "@/components/CapacityBar";
import { BEIRA_CENTER } from "@/data/beira";
import { distanciaMetros, pctOcupado, statusAbrigo, vagasDisponiveis, STATUS_LABEL } from "@/lib/evacuation";
import { iconeServico, labelServico } from "@/lib/servicos";
import { useAbrigos } from "@/lib/use-abrigos";

const STATUS_DOT: Record<ReturnType<typeof statusAbrigo>, string> = {
  disponivel: "bg-green-600",
  quase_cheio: "bg-orange-500",
  cheio: "bg-error",
};

const STATUS_TEXT: Record<ReturnType<typeof statusAbrigo>, string> = {
  disponivel: "text-green-700",
  quase_cheio: "text-orange-700",
  cheio: "text-error",
};

export default function PaginaDetalheAbrigo() {
  const { id } = useParams<{ id: string }>();
  const { abrigos } = useAbrigos();
  const abrigo = abrigos.find((a) => a.id === id);
  const [posicao, setPosicao] = useState<[number, number]>(BEIRA_CENTER);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosicao([pos.coords.longitude, pos.coords.latitude]),
      () => {}
    );
  }, []);

  if (!abrigo) {
    return (
      <div className="flex min-h-dvh flex-col bg-background pb-24 pt-touch-target-min">
        <TopAppBar backHref="/abrigos" />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-gutter-mobile text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
            search_off
          </span>
          <p className="text-body-lg font-sans">Abrigo não encontrado.</p>
          <Link href="/abrigos" className="text-secondary underline underline-offset-4">
            Voltar à lista de abrigos
          </Link>
        </main>
        <Nav />
      </div>
    );
  }

  const distanciaKm = distanciaMetros(posicao, abrigo.coordenadas) / 1000;
  const status = statusAbrigo(abrigo);
  const pct = pctOcupado(abrigo);
  const livres = vagasDisponiveis(abrigo);

  const partilhar = () => {
    const texto = `Abrigo: ${abrigo.nome} — Vagas disponíveis (${abrigo.ocupado}/${abrigo.capacidadeTotal}). Veja a rota segura aqui.`;
    if (navigator.share) {
      navigator.share({ title: `Abrigo: ${abrigo.nome}`, text: texto, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${texto} ${window.location.href}`);
      alert("Link copiado para a área de transferência!");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-24 pt-touch-target-min">
      <TopAppBar backHref="/abrigos" />
      <main className="mx-auto w-full max-w-[1200px] flex-grow overflow-x-hidden">
        <div className="relative flex h-64 w-full items-center justify-center bg-surface-dim">
          <span className="material-symbols-outlined text-[96px] text-outline">place</span>
          <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border-2 border-outline bg-surface px-4 py-2">
            <span className="material-symbols-outlined text-primary">distance</span>
            <span className="text-label-lg font-sans">{distanciaKm.toFixed(1)} km de distância</span>
          </div>
        </div>

        <div className="space-y-stack-lg px-gutter-mobile py-stack-lg">
          <section className="space-y-stack-sm">
            <h2 className="text-headline-lg-mobile font-sans text-on-surface">{abrigo.nome}</h2>
            <p className="text-body-md font-sans text-on-surface-variant">{abrigo.bairro}</p>
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${STATUS_DOT[status]} animate-pulse`} />
              <span className={`text-label-lg font-sans uppercase tracking-widest ${STATUS_TEXT[status]}`}>
                {STATUS_LABEL[status]} ({abrigo.ocupado}/{abrigo.capacidadeTotal})
              </span>
            </div>
          </section>

          <section className="space-y-stack-sm rounded-lg border-2 border-outline-variant bg-surface-container p-stack-md">
            <div className="flex items-center justify-between">
              <span className="text-label-lg font-sans text-on-surface-variant">Capacidade Total</span>
              <span className="text-headline-md font-sans text-on-surface">{pct}%</span>
            </div>
            <CapacityBar abrigo={abrigo} size="lg" />
            <p className="text-label-lg font-sans italic text-on-surface-variant">
              {livres} vagas remanescentes
            </p>
          </section>

          <section className="space-y-stack-md">
            <h3 className="text-headline-md font-sans text-on-surface">Serviços Disponíveis</h3>
            <div className="grid grid-cols-2 gap-4">
              {abrigo.servicos.map((servico) => (
                <div
                  key={servico}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-outline-variant bg-surface-container-low p-4 text-center transition-all hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-[32px] text-secondary">
                    {iconeServico(servico)}
                  </span>
                  <span className="text-label-lg font-sans">{labelServico(servico)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-stack-md pt-4">
            <Link
              href={`/?abrigo=${abrigo.id}`}
              className="flex h-touch-target-min w-full items-center justify-center gap-2 rounded-lg bg-primary text-button-text font-sans text-on-primary shadow-lg transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">directions_run</span>
              COMO CHEGAR (ROTA SEGURA)
            </Link>
            <div className="flex flex-col items-center gap-2 pt-4">
              <button
                type="button"
                onClick={partilhar}
                className="flex items-center gap-2 text-button-text font-sans text-secondary underline underline-offset-4 active:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                Partilhar via WhatsApp/SMS
              </button>
              <p className="px-4 text-center text-[12px] text-on-surface-variant/70">
                Incentivamos a partilha para ajudar outros em necessidade.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Nav />
    </div>
  );
}
