import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: "#0e241b",
        "forest-pill": "#1d4332",
        "forest-accent": "#136343",
        "lime-neon": "#b9f44d",
        canvas: "#f4f6f5",
      },
    },
  },
  plugins: [],
};

export default config;
