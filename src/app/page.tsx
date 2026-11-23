import Hero from "@/components/sections/Hero";
import Erg from "@/components/sections/Erg";
import Mirage from "@/components/sections/Mirage";
import Crossing from "@/components/sections/Crossing";
import Dusk from "@/components/sections/Dusk";
import NightSky from "@/components/sections/NightSky";
import Reserve from "@/components/sections/Reserve";
import Dawn from "@/components/sections/Dawn";

export default function Home() {
  return (
    <main className="relative overflow-x-clip">
      <Hero />
      <Erg />
      <Mirage />
      <Crossing />
      <Dusk />
      <NightSky />
      <Reserve />
      <Dawn />
    </main>
  );
}
