import Link from "next/link";
import { CapacityBar } from "@/components/CapacityBar";
import { STATUS_LABEL, statusAbrigo, vagasDisponiveis } from "@/lib/evacuation";
import type { Shelter } from "@/types";

const STATUS_TEXT_CLASS: Record<ReturnType<typeof statusAbrigo>, string> = {
  disponivel: "font-bold text-green-700",
  quase_cheio: "font-bold text-orange-700",
  cheio: "font-extrabold uppercase text-error",
};

type Props = {
  abrigo: Shelter;
  distanciaKm: number;
};

export function ShelterCard({ abrigo, distanciaKm }: Props) {
  const status = statusAbrigo(abrigo);
  const cheio = status === "cheio";

  return (
    <article
      className={`flex flex-col gap-3 border-2 p-4 ${
        cheio ? "border-error bg-surface-dim opacity-80" : "border-outline bg-surface"
      }`}
    >
      <Link href={`/abrigos/${abrigo.id}`} className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-headline-md font-sans leading-none">{abrigo.nome}</h4>
          <p className="mt-1 text-body-md font-sans text-on-surface-variant">
            {distanciaKm.toFixed(1)} km de distância
          </p>
        </div>
        <span
          className={`material-symbols-outlined ${cheio ? "text-error" : "text-tertiary"}`}
        >
          {cheio ? "block" : "near_me"}
        </span>
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-label-lg font-sans">
          <span>
            Capacidade: {abrigo.ocupado}/{abrigo.capacidadeTotal} vagas
          </span>
          <span className={STATUS_TEXT_CLASS[status]}>{STATUS_LABEL[status]}</span>
        </div>
        <CapacityBar abrigo={abrigo} size="sm" />
      </div>

      {cheio ? (
        <div className="flex h-touch-target-min w-full cursor-not-allowed items-center justify-center gap-2 bg-outline-variant text-button-text font-sans text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">warning</span>
          SEM VAGAS
        </div>
      ) : (
        <Link
          href={`/?abrigo=${abrigo.id}`}
          className="flex h-touch-target-min w-full items-center justify-center gap-2 bg-secondary text-button-text font-sans text-on-secondary transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">directions</span>
          COMO CHEGAR
        </Link>
      )}
      <p className="text-label-lg font-sans text-on-surface-variant">
        {vagasDisponiveis(abrigo)} vagas livres · {abrigo.bairro}
      </p>
    </article>
  );
}
