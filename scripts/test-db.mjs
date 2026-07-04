import postgres from "postgres";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const sql = postgres(env.DATABASE_URL, { connect_timeout: 10, ssl: "prefer" });

try {
  const version = await sql`select version()`;
  console.log("Conectado:", version[0].version);

  const tabelas = await sql`
    select table_name from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `;
  console.log("Tabelas existentes:", tabelas.map((t) => t.table_name));
} catch (e) {
  console.error("Erro de ligação:", e.message);
} finally {
  await sql.end();
}
