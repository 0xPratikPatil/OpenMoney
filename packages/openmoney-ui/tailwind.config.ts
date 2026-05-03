import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          fg: "var(--primary-fg)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          fg: "var(--secondary-fg)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          fg: "var(--muted-fg)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          fg: "var(--accent-fg)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        destructive: "var(--destructive)",
        positive: "var(--positive)",
        negative: "var(--negative)",
        warning: "var(--warning)",
        info: "var(--info)",
        "accent-brand": "var(--accent-brand)",
        "accent-brand-hover": "var(--accent-brand-hover)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
