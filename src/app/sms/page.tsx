import { MvpBanner, Nav } from "@/components/Nav";
import { SimuladorSms } from "@/components/SimuladorSms";

export default function PaginaSms() {
  return (
    <div className="min-h-dvh pb-20">
      <header className="border-b border-slate-700 bg-slate-900 px-4 py-3">
        <h1 className="text-lg font-bold">Simulador SMS</h1>
        <p className="text-xs text-slate-400">Encaminhador de rotas sem GPS</p>
      </header>
      <MvpBanner />
      <SimuladorSms />
      <Nav />
    </div>
  );
}
