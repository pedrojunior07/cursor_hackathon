import { MvpBanner, Nav } from "@/components/Nav";
import { SimuladorUssd } from "@/components/SimuladorUssd";

export default function PaginaUssd() {
  return (
    <div className="min-h-dvh pb-20">
      <header className="border-b border-slate-700 bg-slate-900 px-4 py-3">
        <h1 className="text-lg font-bold">Simulador USSD</h1>
        <p className="text-xs text-slate-400">Modo Resgate para telemóveis básicos</p>
      </header>
      <MvpBanner />
      <SimuladorUssd />
      <Nav />
    </div>
  );
}
