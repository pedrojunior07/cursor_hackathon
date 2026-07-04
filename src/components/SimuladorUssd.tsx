"use client";

import { useState, useCallback } from "react";
import { USSD_CODE, bairros } from "@/data/beira";
import { bairroPorNome } from "@/lib/evacuation";
import { interpretarPedidoCliente } from "@/lib/intent-client";
import {
  ussdInicial,
  renderUssd,
  processarUssd,
  type UssdContext,
} from "@/lib/ussd";
import type { UssdScreen } from "@/types";

const PASSOS_COM_BAIRRO = new Set(["resgate_bairro", "zona_bairro", "sms_bairro"]);

/** Se o passo espera um bairro e a correspondência directa falha, tenta IA como fallback. */
async function resolverEntradaUssd(ctx: UssdContext, entrada: string): Promise<string> {
  if (!PASSOS_COM_BAIRRO.has(ctx.state.step)) return entrada;

  const idx = parseInt(entrada, 10);
  const direta = !isNaN(idx) && idx >= 1 && idx <= bairros.length
    ? bairros[idx - 1]
    : bairroPorNome(entrada, bairros);
  if (direta) return entrada;

  const intento = await interpretarPedidoCliente(entrada);
  const bairroIA = intento?.bairroId ? bairros.find((b) => b.id === intento.bairroId) : undefined;
  return bairroIA ? bairroIA.nome : entrada;
}

const SMS_QUEUE_KEY = "rota-segura-sms-queue";

function enfileirarSms(textos: string[]) {
  const existente = JSON.parse(localStorage.getItem(SMS_QUEUE_KEY) ?? "[]") as string[];
  localStorage.setItem(SMS_QUEUE_KEY, JSON.stringify([...existente, ...textos]));
  window.dispatchEvent(new Event("rota-segura-sms"));
}

export function SimuladorUssd() {
  const [ctx, setCtx] = useState<UssdContext>(ussdInicial);
  const [ecra, setEcran] = useState<UssdScreen>(renderUssd(ussdInicial()));
  const [input, setInput] = useState("");
  const [historico, setHistorico] = useState<string[]>([]);
  const [activo, setActivo] = useState(false);

  const iniciar = () => {
    const inicial = ussdInicial();
    setCtx(inicial);
    setEcran(renderUssd(inicial));
    setHistorico([`Marcou ${USSD_CODE}`]);
    setActivo(true);
    setInput("");
  };

  const enviar = useCallback(async () => {
    const entrada = input.trim();
    if (!entrada) return;
    const entradaResolvida = await resolverEntradaUssd(ctx, entrada);
    const resultado = processarUssd(ctx, entradaResolvida);
    setCtx(resultado.ctx);
    setEcran(resultado.screen);
    setHistorico((h) => [...h, `> ${entrada}`, ...resultado.screen.linhas]);
    if (resultado.smsDisparo?.length) {
      enfileirarSms(resultado.smsDisparo);
    }
    setInput("");
    if (resultado.terminado) {
      setTimeout(() => setActivo(false), 1500);
    }
  }, [ctx, input]);

  return (
    <div className="mx-auto max-w-sm space-y-4 p-4">
      <div className="rounded-2xl border-4 border-slate-600 bg-slate-950 p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span>Vodacom MZ</span>
          <span>▮▮▮ 🔋</span>
        </div>

        {!activo ? (
          <div className="space-y-4 py-8 text-center">
            <p className="font-mono text-2xl font-bold tracking-wider text-white">
              {USSD_CODE}
            </p>
            <p className="text-sm text-slate-400">
              Simulador USSD — telemóveis básicos sem internet
            </p>
            <button
              type="button"
              onClick={iniciar}
              className="w-full rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white active:bg-emerald-700"
            >
              Ligar Modo Resgate
            </button>
          </div>
        ) : (
          <div className="min-h-[280px] space-y-3 font-mono text-sm">
            <p className="border-b border-slate-700 pb-2 font-bold text-sky-400">
              {ecra.titulo}
            </p>
            {ecra.linhas.map((linha, i) => (
              <p key={i} className="text-slate-200">
                {linha}
              </p>
            ))}
            {ecra.opcoes?.map((op) => (
              <p key={op.tecla} className="text-emerald-400">
                {op.tecla}. {op.label}
              </p>
            ))}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviar()}
                placeholder={ecra.inputPlaceholder ?? "Opção"}
                className="flex-1 rounded border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none focus:border-sky-500"
                autoFocus
              />
              <button
                type="button"
                onClick={enviar}
                className="rounded bg-sky-600 px-4 py-2 font-semibold text-white"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>

      {historico.length > 0 && (
        <details className="rounded-lg bg-slate-800/50 p-3 text-xs text-slate-400">
          <summary className="cursor-pointer font-medium text-slate-300">
            Histórico da sessão
          </summary>
          <pre className="mt-2 whitespace-pre-wrap">{historico.join("\n")}</pre>
        </details>
      )}

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-xs text-slate-400">
        <p className="font-medium text-slate-300">Fluxo demo:</p>
        <ol className="mt-1 list-inside list-decimal space-y-1">
          <li>Ligar → escolher <strong>1</strong> (Modo Resgate)</li>
          <li>Indicar bairro (ex: <strong>2</strong> = Munhava)</li>
          <li>Confirmar <strong>1</strong> para enviar rota por SMS</li>
          <li>Abrir separador SMS para ver instruções</li>
        </ol>
      </div>
    </div>
  );
}
