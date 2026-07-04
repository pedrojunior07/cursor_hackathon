import { MvpBanner, Nav } from "@/components/Nav";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { SimuladorUssd } from "@/components/SimuladorUssd";

export default function PaginaUssd() {
  return (
    <div className="min-h-dvh pb-24 pt-touch-target-min">
      <TopAppBar />
      <MvpBanner />
      <div className="px-gutter-mobile pt-stack-md">
        <h2 className="text-headline-md font-sans text-on-surface">Simulador USSD</h2>
        <p className="text-body-md font-sans text-on-surface-variant">
          Modo Resgate para telemóveis básicos
        </p>
      </div>
      <SimuladorUssd />
      <Nav />
    </div>
  );
}
