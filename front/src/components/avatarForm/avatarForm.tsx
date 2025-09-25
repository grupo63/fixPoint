"use client";

interface DefaultAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

const colorVariants = [
  "bg-gray-100",
  "bg-gray-200",
  "bg-gray-300",
  "bg-gray-400",
  "bg-gray-500",
  "bg-gray-600",
  "bg-gray-700",
  "bg-gray-800",
];

export default function DefaultAvatar({
  name,
  size = "md",
  className = "",
}: DefaultAvatarProps) {
  // Extraer iniciales del nombre y apellido
  const getInitials = (fullName: string) => {
    if (!fullName || fullName.trim() === "") return "?";

    const words = fullName.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    // Tomar primera letra del primer nombre y primera letra del último apellido
    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Generar color consistente basado en el nombre
  const getColorClass = (fullName: string) => {
    if (!fullName) return colorVariants[0];

    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colorVariants[Math.abs(hash) % colorVariants.length];
  };

  const initials = getInitials(name);
  const colorClass = getColorClass(name);

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClass}
        rounded-full
        flex
        items-center
        justify-center
        text-gray-800
        font-light
        select-none
        ${className}
      `}
      title={name || "Usuario"}
    >
      {initials}
    </div>
  );
}
