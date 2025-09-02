import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",
        secondary: "#F59E0B",
        accent: "#10B981",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Graduate", "serif"],
      },
    },
  },
} satisfies Config;
