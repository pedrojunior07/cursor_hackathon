import { pctOcupado, statusAbrigo } from "@/lib/evacuation";
import type { Shelter } from "@/types";

const BAR_COLOR: Record<ReturnType<typeof statusAbrigo>, string> = {
  disponivel: "bg-green-600",
  quase_cheio: "bg-orange-500",
  cheio: "bg-error",
};

type Props = {
  abrigo: Shelter;
  /** sm = barra fina da lista; lg = barra arredondada do detalhe */
  size?: "sm" | "lg";
};

export function CapacityBar({ abrigo, size = "sm" }: Props) {
  const pct = pctOcupado(abrigo);
  const status = statusAbrigo(abrigo);

  if (size === "lg") {
    return (
      <div className="h-6 w-full overflow-hidden rounded-full border border-outline-variant bg-surface-container-highest">
        <div
          className={`h-full rounded-full transition-all duration-700 ${BAR_COLOR[status]}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    );
  }

  return (
    <div className="h-4 w-full overflow-hidden border border-outline-variant bg-surface-container-highest">
      <div
        className={`h-full ${BAR_COLOR[status]}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}
