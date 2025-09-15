import Navbar from "@/components/navbar/navBar";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col justify-center items-center">
      <Navbar />
      <div className="flex flex-1">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
