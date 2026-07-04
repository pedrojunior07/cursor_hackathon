import type { EvacuationPlan, SmsMessage } from "@/types";
import { abrigos, bairros, zonasRisco, SMS_SHORTCODE } from "@/data/beira";
import {
  planoEvacuacao,
  bairroPorNome,
  formatarSmsPlano,
  formatarSmsPasso,
  nivelRiscoLabel,
} from "@/lib/evacuation";

export type SmsSession = {
  plano?: EvacuationPlan;
  passoAtual: number;
  aguardandoLocalizacao: boolean;
};

export function smsInicial(): SmsSession {
  return { passoAtual: 0, aguardandoLocalizacao: true };
}

function msgSistema(texto: string): SmsMessage {
  return {
    id: crypto.randomUUID(),
    de: "sistema",
    texto,
    timestamp: new Date(),
  };
}

function msgUtilizador(texto: string): SmsMessage {
  return {
    id: crypto.randomUUID(),
    de: "utilizador",
    texto,
    timestamp: new Date(),
  };
}

export function processarSms(
  sessao: SmsSession,
  texto: string
): { sessao: SmsSession; mensagens: SmsMessage[] } {
  const entrada = texto.trim();
  const resposta: SmsMessage[] = [msgUtilizador(entrada)];
  const cmd = entrada.toUpperCase();

  if (cmd === "AJUDA" || cmd === "SOS") {
    resposta.push(
      msgSistema(
        `ROTA SEGURA MZ: Resgate activado. Envie o nome do seu bairro ou "GPS" se tiver localização. Centro: ${SMS_SHORTCODE}`
      )
    );
    return { sessao: { ...sessao, aguardandoLocalizacao: true }, mensagens: resposta };
  }

  if (cmd === "PROXIMO" && sessao.plano) {
    const { passos } = sessao.plano;
    if (sessao.passoAtual >= passos.length) {
      resposta.push(
        msgSistema(
          `Chegou ao destino: ${sessao.plano.abrigo.nome}. Apresente-se à coordenação do abrigo.`
        )
      );
      return { sessao, mensagens: resposta };
    }
    resposta.push(
      msgSistema(formatarSmsPasso(passos[sessao.passoAtual], sessao.passoAtual, passos.length))
    );
    return {
      sessao: { ...sessao, passoAtual: sessao.passoAtual + 1 },
      mensagens: resposta,
    };
  }

  if (cmd === "GPS") {
    resposta.push(
      msgSistema(
        "Para usar GPS, abra a app Rota Segura no telemóvel. Sem internet? Envie o nome do seu bairro (ex: Munhava)."
      )
    );
    return { sessao, mensagens: resposta };
  }

  if (cmd === "ZONA" || cmd === "RISCO") {
    resposta.push(
      msgSistema(
        `Bairros em risco crítico: ${bairros.filter((b) => b.nivelRisco === "critico").map((b) => b.nome).join(", ")}. Envie o seu bairro para detalhes.`
      )
    );
    return { sessao, mensagens: resposta };
  }

  const bairro = bairroPorNome(entrada, bairros);
  if (bairro) {
    const plano = planoEvacuacao(bairro.coordenadas, abrigos, zonasRisco);
    const novaSessao: SmsSession = {
      plano,
      passoAtual: 0,
      aguardandoLocalizacao: false,
    };
    const intro = formatarSmsPlano(plano);
    intro.forEach((t) => resposta.push(msgSistema(t)));
    resposta.push(
      msgSistema(
        `Risco em ${bairro.nome}: ${nivelRiscoLabel(bairro.nivelRisco)}. Envie PROXIMO para a 1ª instrução.`
      )
    );
    return { sessao: novaSessao, mensagens: resposta };
  }

  if (sessao.aguardandoLocalizacao) {
    resposta.push(
      msgSistema(
        `Não reconheci "${entrada}". Envie o bairro (Munhava, Manga, Ponta-Gêa...), ZONA, AJUDA ou GPS.`
      )
    );
  } else {
    resposta.push(
      msgSistema('Comandos: PROXIMO (próxima instrução), AJUDA (resgate), ZONA (alertas).')
    );
  }

  return { sessao, mensagens: resposta };
}

export function mensagemBoasVindas(): SmsMessage {
  return msgSistema(
    `ROTA SEGURA MZ — Envie o seu bairro para receber rota de evacuação. Sem GPS? Funciona só por SMS. Comandos: AJUDA, ZONA, PROXIMO.`
  );
}

export function injetarPlanoSms(plano: EvacuationPlan): SmsMessage[] {
  return formatarSmsPlano(plano).map(msgSistema);
}
