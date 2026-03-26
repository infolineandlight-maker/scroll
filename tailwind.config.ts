import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
      colors: {
        brand: {
          red: "#be1921",
          "red-dark": "#af0d0d",
          "red-light": "#ff9090",
        },
        loader: "#e1dedf",
      },
    },
  },
  plugins: [],
} satisfies Config;
