"use client";

import { useCallback, useEffect, useState } from "react";
import { abrigos as abrigosEstaticos } from "@/data/beira";
import type { Shelter } from "@/types";

export function useAbrigos(intervalMs = 15000) {
  const [abrigos, setAbrigos] = useState<Shelter[]>(abrigosEstaticos);
  const [fonte, setFonte] = useState<"db" | "local">("local");
  const [aCarregar, setACarregar] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const res = await fetch("/api/abrigos", { cache: "no-store" });
      if (!res.ok) throw new Error("resposta não ok");
      const data = (await res.json()) as { abrigos: Shelter[]; fonte: "db" | "local" };
      if (Array.isArray(data.abrigos) && data.abrigos.length > 0) {
        setAbrigos(data.abrigos);
        setFonte(data.fonte);
      }
    } catch {
      /* mantém os dados estáticos já carregados */
    } finally {
      setACarregar(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    const id = setInterval(carregar, intervalMs);
    return () => clearInterval(id);
  }, [carregar, intervalMs]);

  return { abrigos, fonte, aCarregar, recarregar: carregar };
}
