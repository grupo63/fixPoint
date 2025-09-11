"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

type ServicesCardProps = {
  title: string;
  count: number;
  imageUrl: string;
  href: string;
};

export default function ServicesCard({
  title,
  count,
  imageUrl,
  href,
}: ServicesCardProps) {
  const router = useRouter();

  const handleRedirect = () => {
    setTimeout(() => {
      router.push(href);
    }, 2000); // 2 segundos
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className="relative h-40 w-full">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {count} profesionales disponibles
          </p>
        </div>

        <button
          onClick={handleRedirect}
          className="mt-3 inline-flex items-center text-blue-600 font-medium text-sm hover:underline cursor-pointer"
        >
          Ver profesionales →
        </button>
      </div>
    </div>
  );
}
