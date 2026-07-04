const ICONES: Record<string, string> = {
  água: "water_drop",
  wc: "wc",
  medicamentos: "medical_services",
  alimentos: "restaurant",
  abrigo: "home",
  família: "family_restroom",
};

const LABELS: Record<string, string> = {
  água: "Água Potável",
  wc: "WC Sanitários",
  medicamentos: "Medicamentos",
  alimentos: "Alimentos",
  abrigo: "Abrigo",
  família: "Espaço Família",
};

export function iconeServico(servico: string): string {
  return ICONES[servico.toLowerCase()] ?? "check_circle";
}

export function labelServico(servico: string): string {
  return LABELS[servico.toLowerCase()] ?? servico;
}
