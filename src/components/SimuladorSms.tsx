"use client";

import { useState, useEffect, useRef } from "react";
import { SMS_SHORTCODE, bairros } from "@/data/beira";
import { bairroPorNome } from "@/lib/evacuation";
import { interpretarPedidoCliente } from "@/lib/intent-client";
import {
  smsInicial,
  processarSms,
  mensagemBoasVindas,
  type SmsSession,
} from "@/lib/sms";
import type { SmsMessage } from "@/types";

const SMS_QUEUE_KEY = "rota-segura-sms-queue";
const COMANDOS_CONHECIDOS = new Set(["AJUDA", "SOS", "PROXIMO", "GPS", "ZONA", "RISCO"]);

/** Se o texto não for um comando conhecido nem um bairro reconhecido, tenta IA como fallback. */
async function resolverEntradaSms(entrada: string): Promise<string> {
  if (COMANDOS_CONHECIDOS.has(entrada.toUpperCase())) return entrada;
  if (bairroPorNome(entrada, bairros)) return entrada;

  const intento = await interpretarPedidoCliente(entrada);
  const bairroIA = intento?.bairroId ? bairros.find((b) => b.id === intento.bairroId) : undefined;
  return bairroIA ? bairroIA.nome : entrada;
}

export function SimuladorSms() {
  const [sessao, setSessao] = useState<SmsSession>(smsInicial);
  const [mensagens, setMensagens] = useState<SmsMessage[]>([]);
  const [texto, setTexto] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMensagens([mensagemBoasVindas()]);
  }, []);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  useEffect(() => {
    const processarFila = () => {
      const fila = JSON.parse(localStorage.getItem(SMS_QUEUE_KEY) ?? "[]") as string[];
      if (fila.length === 0) return;
      localStorage.removeItem(SMS_QUEUE_KEY);
      const novas: SmsMessage[] = fila.map((t) => ({
        id: crypto.randomUUID(),
        de: "sistema" as const,
        texto: t,
        timestamp: new Date(),
      }));
      setMensagens((m) => [...m, ...novas]);
    };

    processarFila();
    window.addEventListener("rota-segura-sms", processarFila);
    return () => window.removeEventListener("rota-segura-sms", processarFila);
  }, []);

  const enviar = async () => {
    const entrada = texto.trim();
    if (!entrada) return;
    const entradaResolvida = await resolverEntradaSms(entrada);
    const { sessao: nova, mensagens: novas } = processarSms(sessao, entradaResolvida);
    setSessao(nova);
    setMensagens((m) => [...m, ...novas]);
    setTexto("");
  };

  const atalhos = ["Munhava", "Manga", "PROXIMO", "AJUDA", "ZONA"];

  return (
    <div className="mx-auto flex max-w-sm flex-col p-4" style={{ height: "calc(100dvh - 8rem)" }}>
      <div className="mb-3 flex items-center gap-3 border-b border-slate-700 pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold">
          RS
        </div>
        <div>
          <p className="font-semibold">Rota Segura MZ</p>
          <p className="text-xs text-slate-400">{SMS_SHORTCODE} · Encaminhador SMS</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.de === "utilizador" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.de === "utilizador"
                  ? "rounded-br-md bg-sky-600 text-white"
                  : "rounded-bl-md bg-slate-700 text-slate-100"
              }`}
            >
              {msg.texto}
              <p className="mt-1 text-[10px] opacity-60">
                {msg.timestamp.toLocaleTimeString("pt-MZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={fimRef} />
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        {atalhos.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setTexto(a)}
            className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
          >
            {a}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          placeholder="Bairro ou comando (PROXIMO, AJUDA…)"
          className="flex-1 rounded-full border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
        />
        <button
          type="button"
          onClick={enviar}
          className="rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white active:bg-emerald-700"
        >
          Enviar
        </button>
      </div>

      <p className="mt-3 text-center text-[10px] text-slate-500">
        MVP: simula SMS para quem não tem smartphone/GPS. Na produção, integra com gateway
        Vodacom/mCel.
      </p>
    </div>
  );
}
