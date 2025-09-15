import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",
        secondary: "#F59E0B",
        accent: "#10B981",
        fixpoint: {
          blue: "#162748",
          orange: "#ed7d31",
          hover: {
            blue: "#5e7a8d",
            orange: "#b45d27",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Graduate", "serif"],
      },
    },
  },
} satisfies Config;
