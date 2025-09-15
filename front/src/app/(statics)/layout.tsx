import type { ReactNode } from "react";
import Navbar from "@/components/navbar/navBar";
import Footer from "@/components/footer/footer";

export default function StaticsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col justify-center items-center">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
