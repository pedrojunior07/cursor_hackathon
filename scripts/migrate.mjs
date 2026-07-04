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

const seed = [
  { id: "abr-1", nome: "Escola Secundária da Manga", bairro: "Manga", lng: 34.8621, lat: -19.8154, capacidadeTotal: 350, ocupado: 120, servicos: ["água", "WC", "medicamentos"] },
  { id: "abr-2", nome: "Centro Comunitário Munhava", bairro: "Munhava", lng: 34.8512, lat: -19.8298, capacidadeTotal: 200, ocupado: 178, servicos: ["água", "WC"] },
  { id: "abr-3", nome: "Escola Primária Ponta-Gêa", bairro: "Ponta-Gêa", lng: 34.8287, lat: -19.8512, capacidadeTotal: 180, ocupado: 45, servicos: ["água", "WC", "alimentos"] },
  { id: "abr-4", nome: "Ginásio Estádio Ferroviário", bairro: "Ponta-Gêa", lng: 34.8356, lat: -19.8489, capacidadeTotal: 500, ocupado: 210, servicos: ["água", "WC", "medicamentos", "alimentos"] },
  { id: "abr-5", nome: "Centro INGC Macuti", bairro: "Macuti", lng: 34.8723, lat: -19.8612, capacidadeTotal: 280, ocupado: 95, servicos: ["água", "WC", "medicamentos"] },
  { id: "abr-6", nome: "Igreja Paroquial da Beira", bairro: "Centro", lng: 34.8398, lat: -19.8367, capacidadeTotal: 150, ocupado: 130, servicos: ["água", "abrigo"] },
];

try {
  await sql`
    create table if not exists abrigos (
      id text primary key,
      nome text not null,
      bairro text not null,
      lng double precision not null,
      lat double precision not null,
      capacidade_total integer not null,
      ocupado integer not null default 0,
      servicos text[] not null default '{}',
      actualizado_em timestamptz not null default now()
    )
  `;
  console.log("Tabela abrigos: ok");

  for (const a of seed) {
    await sql`
      insert into abrigos (id, nome, bairro, lng, lat, capacidade_total, ocupado, servicos)
      values (${a.id}, ${a.nome}, ${a.bairro}, ${a.lng}, ${a.lat}, ${a.capacidadeTotal}, ${a.ocupado}, ${a.servicos})
      on conflict (id) do nothing
    `;
  }
  const total = await sql`select count(*)::int as n from abrigos`;
  console.log(`Seed concluído. Linhas em abrigos: ${total[0].n}`);
} catch (e) {
  console.error("Erro na migração:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
