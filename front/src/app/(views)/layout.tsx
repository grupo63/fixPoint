import type { ReactNode } from "react";
import Navbar from "@/components/navbar/navBar";
import Footer from "@/components/footer/footer";

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
