import ServicesCard from "@/components/servicesCard/serviceCard";

export default function ServicesPage() {
  const services = [
    {
      title: "Plomería",
      count: 0,
      imageUrl: "/Plomeria.jpg", // desde public
      href: "/professionals?category=plomeria",
    },
    {
      title: "Electricidad",
      count: 0,
      imageUrl: "/Electricidad.jpg", // desde public
      href: "/professionals?category=electricidad",
    },
    {
      title: "Carpintería",
      count: 0,
      imageUrl: "/Carpinteria.jpg", // desde public
      href: "/professionals?category=carpinteria",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((s) => (
        <ServicesCard
          key={s.title}
          title={s.title}
          count={s.count}
          imageUrl={s.imageUrl}
          href={s.href}
        />
      ))}
    </main>
  );
}
