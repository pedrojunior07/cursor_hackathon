export type Shelter = {
  id: string;
  nome: string;
  bairro: string;
  coordenadas: [number, number]; // [lng, lat]
  capacidadeTotal: number;
  ocupado: number;
  servicos: string[];
};

export type Bairro = {
  id: string;
  nome: string;
  coordenadas: [number, number];
  nivelRisco: "baixo" | "medio" | "alto" | "critico";
};

export type FloodZone = {
  id: string;
  nome: string;
  nivel: "alerta" | "inundacao";
  coordinates: [number, number][][];
};

export type RouteStep = {
  instrucao: string;
  direcao: "norte" | "sul" | "este" | "oeste" | "nordeste" | "noroeste" | "sudeste" | "sudoeste";
  distanciaMetros: number;
};

export type SmsMessage = {
  id: string;
  de: "sistema" | "utilizador";
  texto: string;
  timestamp: Date;
};

export type UssdScreen = {
  titulo: string;
  linhas: string[];
  opcoes?: { tecla: string; label: string }[];
  inputMode?: boolean;
  inputPlaceholder?: string;
};

export type EvacuationPlan = {
  abrigo: Shelter;
  distanciaMetros: number;
  tempoMinutos: number;
  passos: RouteStep[];
  rotaCoordenadas: [number, number][];
};
