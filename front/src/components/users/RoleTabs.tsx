"use client";

import { useState } from "react";

type Role = "all" | "professional" | "client";

type Props = {
  onChange: (role: Role) => void;
};

const tabs = [
  { label: "Todos", value: "all", color: "text-[#b45d27] border-[#b45d27]" },
  {
    label: "Profesionales",
    value: "professional",
    color: "text-[#64748b] border-[#64748b]",
  },
  {
    label: "Clientes",
    value: "client",
    color: "text-[#84a848] border-[#84a848]",
  },
] as const;

export default function RoleTabs({ onChange }: Props) {
  const [active, setActive] = useState<Role>("all");

  const handleTabClick = (value: Role) => {
    setActive(value);
    onChange(value);
  };

  return (
    <div className="flex items-start gap-6">
      {tabs.map((tab) => {
        const isActive = active === tab.value;

        const base = "text-lg px-4 font-regular pb-1 border-b-3 transition-all";
        const activeStyle = `${tab.color}`;
        const inactiveStyle =
          "text-gray-400 border-transparent hover:text-gray-500";

        return (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={`${base} ${isActive ? activeStyle : inactiveStyle}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
