import postgres from "postgres";

let sql: ReturnType<typeof postgres> | null = null;

/** Devolve o cliente Postgres, ou null se DATABASE_URL não estiver configurada. */
export function getDb() {
  if (!process.env.DATABASE_URL) return null;
  if (!sql) {
    sql = postgres(process.env.DATABASE_URL, { ssl: "prefer", max: 5 });
  }
  return sql;
}
