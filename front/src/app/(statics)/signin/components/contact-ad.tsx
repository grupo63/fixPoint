"use client";

import { Phone, MapPin } from "lucide-react";

export default function ContactAd() {
  return (
    <aside className=" w-full max-w-sm space-y-6">
      <div className="px-8">
        <p className="text-[#7A99AC] font-medium">Contact Us</p>
        <h2 className="text-2xl font-bold text-[#0E2A47] leading-snug mt-1">
          Detrás de cada arreglo <br />
          hay una historia que mejora. <br />
          Conectamos personas <br />
          con personas.
        </h2>
      </div>

      <div className="bg-[#B54C1F] text-white px-8 py-6 w-fit rounded-tl-[40px] rounded-br-[40px]  space-y-4">
        <p className="font-semibold text-lg">
          ¿Necesitas ayuda? <br /> contactate a:
        </p>

        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          <span className="text-base">011-796-9200</span>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 mt-1" />
          <span className="text-base">Av Del Libertador 1700</span>
        </div>
      </div>
    </aside>
  );
}
