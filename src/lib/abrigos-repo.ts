import { getDb } from "@/lib/db";
import type { Shelter } from "@/types";

type LinhaAbrigo = {
  id: string;
  nome: string;
  bairro: string;
  lng: number;
  lat: number;
  capacidade_total: number;
  ocupado: number;
  servicos: string[];
  actualizado_em: Date;
};

function paraShelter(row: LinhaAbrigo): Shelter & { actualizadoEm: string } {
  return {
    id: row.id,
    nome: row.nome,
    bairro: row.bairro,
    coordenadas: [row.lng, row.lat],
    capacidadeTotal: row.capacidade_total,
    ocupado: row.ocupado,
    servicos: row.servicos,
    actualizadoEm: row.actualizado_em.toISOString(),
  };
}

/** Lista abrigos da BD. Devolve null se a BD não estiver configurada/acessível. */
export async function listarAbrigosDb() {
  const sql = getDb();
  if (!sql) return null;
  try {
    const rows = await sql<LinhaAbrigo[]>`
      select id, nome, bairro, lng, lat, capacidade_total, ocupado, servicos, actualizado_em
      from abrigos
      order by nome
    `;
    return rows.map(paraShelter);
  } catch (e) {
    console.error("listarAbrigosDb falhou:", e);
    return null;
  }
}

export type AtualizacaoCapacidade =
  | { tipo: "delta"; delta: number }
  | { tipo: "marcar_cheio" };

/** Actualiza a ocupação de um abrigo. Devolve o abrigo actualizado, ou null se não existir/BD indisponível. */
export async function atualizarCapacidadeDb(id: string, mudanca: AtualizacaoCapacidade) {
  const sql = getDb();
  if (!sql) return null;
  try {
    const rows =
      mudanca.tipo === "marcar_cheio"
        ? await sql<LinhaAbrigo[]>`
            update abrigos
            set ocupado = capacidade_total, actualizado_em = now()
            where id = ${id}
            returning id, nome, bairro, lng, lat, capacidade_total, ocupado, servicos, actualizado_em
          `
        : await sql<LinhaAbrigo[]>`
            update abrigos
            set ocupado = greatest(0, least(capacidade_total, ocupado + ${mudanca.delta})),
                actualizado_em = now()
            where id = ${id}
            returning id, nome, bairro, lng, lat, capacidade_total, ocupado, servicos, actualizado_em
          `;
    if (rows.length === 0) return null;
    return paraShelter(rows[0]);
  } catch (e) {
    console.error("atualizarCapacidadeDb falhou:", e);
    return null;
  }
}
