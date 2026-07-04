import { NextResponse } from "next/server";
import { abrigos as abrigosEstaticos } from "@/data/beira";
import { listarAbrigosDb } from "@/lib/abrigos-repo";

export async function GET() {
  const daBd = await listarAbrigosDb();
  if (daBd && daBd.length > 0) {
    return NextResponse.json({ abrigos: daBd, fonte: "db" as const });
  }
  return NextResponse.json({ abrigos: abrigosEstaticos, fonte: "local" as const });
}
