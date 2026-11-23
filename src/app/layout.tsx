import type { Metadata, Viewport } from "next";
import { Amiri, Bodoni_Moda, Bricolage_Grotesque, DM_Mono } from "next/font/google";
import DesertGL from "@/components/DesertGL";
import Engine from "@/components/Engine";
import Header from "@/components/Header";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["opsz", "wdth"] });
const bodoni = Bodoni_Moda({ variable: "--font-bodoni", subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"] });
const amiri = Amiri({ variable: "--font-amiri", subsets: ["arabic"], weight: ["400", "700"], preload: false });
const dmmono = DM_Mono({ variable: "--font-dmmono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "ERG — Cinco días cruzando el mar de arena",
  description:
    "Travesías por el Sahara en luna nueva. Desliza y vive veinticuatro horas en el desierto: del alba a la noche más oscura.",
};

export const viewport: Viewport = { themeColor: "#1a1220" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${bricolage.variable} ${bodoni.variable} ${amiri.variable} ${dmmono.variable} antialiased`}>
      <body>
        <DesertGL />
        <Engine />
        <Header />
        {children}
      </body>
    </html>
  );
}
