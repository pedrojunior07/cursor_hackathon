import type { Shelter, Bairro, FloodZone } from "@/types";

export const BEIRA_CENTER: [number, number] = [34.8389, -19.8436];

export const abrigos: Shelter[] = [
  {
    id: "abr-1",
    nome: "Escola Secundária da Manga",
    bairro: "Manga",
    coordenadas: [34.8621, -19.8154],
    capacidadeTotal: 350,
    ocupado: 120,
    servicos: ["água", "WC", "medicamentos"],
  },
  {
    id: "abr-2",
    nome: "Centro Comunitário Munhava",
    bairro: "Munhava",
    coordenadas: [34.8512, -19.8298],
    capacidadeTotal: 200,
    ocupado: 178,
    servicos: ["água", "WC"],
  },
  {
    id: "abr-3",
    nome: "Escola Primária Ponta-Gêa",
    bairro: "Ponta-Gêa",
    coordenadas: [34.8287, -19.8512],
    capacidadeTotal: 180,
    ocupado: 45,
    servicos: ["água", "WC", "alimentos"],
  },
  {
    id: "abr-4",
    nome: "Ginásio Estádio Ferroviário",
    bairro: "Ponta-Gêa",
    coordenadas: [34.8356, -19.8489],
    capacidadeTotal: 500,
    ocupado: 210,
    servicos: ["água", "WC", "medicamentos", "alimentos"],
  },
  {
    id: "abr-5",
    nome: "Centro INGC Macuti",
    bairro: "Macuti",
    coordenadas: [34.8723, -19.8612],
    capacidadeTotal: 280,
    ocupado: 95,
    servicos: ["água", "WC", "medicamentos"],
  },
  {
    id: "abr-6",
    nome: "Igreja Paroquial da Beira",
    bairro: "Centro",
    coordenadas: [34.8398, -19.8367],
    capacidadeTotal: 150,
    ocupado: 130,
    servicos: ["água", "abrigo"],
  },
];

export const bairros: Bairro[] = [
  { id: "b1", nome: "Manga", coordenadas: [34.858, -19.818], nivelRisco: "alto" },
  { id: "b2", nome: "Munhava", coordenadas: [34.848, -19.832], nivelRisco: "critico" },
  { id: "b3", nome: "Ponta-Gêa", coordenadas: [34.832, -19.85], nivelRisco: "medio" },
  { id: "b4", nome: "Macuti", coordenadas: [34.868, -19.858], nivelRisco: "alto" },
  { id: "b5", nome: "Centro", coordenadas: [34.839, -19.837], nivelRisco: "baixo" },
  { id: "b6", nome: "Chipangara", coordenadas: [34.855, -19.845], nivelRisco: "medio" },
];

export const zonasRisco: FloodZone[] = [
  {
    id: "z1",
    nome: "Bacia Munhava",
    nivel: "inundacao",
    coordinates: [
      [
        [34.844, -19.834],
        [34.856, -19.834],
        [34.856, -19.826],
        [34.844, -19.826],
        [34.844, -19.834],
      ],
    ],
  },
  {
    id: "z2",
    nome: "Margem Manga",
    nivel: "inundacao",
    coordinates: [
      [
        [34.858, -19.82],
        [34.868, -19.82],
        [34.868, -19.812],
        [34.858, -19.812],
        [34.858, -19.82],
      ],
    ],
  },
  {
    id: "z3",
    nome: "Zona Macuti baixa",
    nivel: "alerta",
    coordinates: [
      [
        [34.866, -19.864],
        [34.878, -19.864],
        [34.878, -19.856],
        [34.866, -19.856],
        [34.866, -19.864],
      ],
    ],
  },
];

export const USSD_CODE = "*384*7#";
export const SMS_SHORTCODE = "3847";
