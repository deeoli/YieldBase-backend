import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          navy: "#0B1F3B",
        },
        accent: {
          gold: "#F4B41A",
        },
        background: {
          light: "#F7F7FB",
        },
        card: {
          bg: "#FFFFFF",
        },
        text: {
          dark: "#111827",
          muted: "#6B7280",
        },
        border: {
          grey: "#E5E7EB",
        },
        yield: {
          high: {
            bg: "#DCFCE7",
            text: "#166534",
          },
        },
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

