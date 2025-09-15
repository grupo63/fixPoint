"use client";

type RoleTab = "user" | "professional";

export default function RoleTabs({
  role,
  onChange,
}: {
  role: RoleTab;
  onChange: (r: RoleTab) => void;
}) {
  const tabs: { key: RoleTab; label: string; color: string }[] = [
    { key: "user", label: "Usuario", color: "#B54C1F" },
    { key: "professional", label: "Profesional", color: "#7ea032" },
  ];

  return (
    <div className="flex gap-8 border-b">
      {tabs.map((t) => {
        const isActive = role === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`pb-2 font-thin text-2xl border-b-4 ${
              isActive ? "" : "text-gray-400 border-transparent"
            }`}
            style={
              isActive
                ? { color: t.color, borderBottomColor: t.color }
                : undefined
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
