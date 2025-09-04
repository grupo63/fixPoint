import Image from "next/image";

export default function Home() {
  return (
    <main className="flex justify-center items-center h-screen p-6 bg-gray-50">
    
      <div className="flex items-center gap-6 relative w-full justify-between">
        
      
        <div className="flex gap-4">
          <div className="w-64 h-[400px] rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <p className="text-lg font-semibold">Texto 1</p>
          </div>
          <div className="w-64 h-[400px] rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <p className="text-lg font-semibold">Texto 2</p>
          </div>
          <div className="w-64 h-[400px] rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <p className="text-lg font-semibold">Texto 3</p>
          </div>
        </div>

      
        <Image
          src="/plomero.jpg"
          alt="Plomero trabajando"
          width={400}
          height={300}
          className="absolute top-1/2 right-20 -translate-y-1/2 rounded-xl shadow-lg"
        />
      </div>
    </main>
  );
}
