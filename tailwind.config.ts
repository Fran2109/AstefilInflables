import type { Config } from "tailwindcss";

/**
 * Sistema de diseño "neo-brutalismo caramelo" de Astefil.
 * Los colores de marca son constantes (hex). Los tokens semánticos de shadcn/ui
 * (background, foreground, border, ring…) se definen con CSS vars en index.css
 * para que las tablas y formularios del admin encajen sin pelear con la marca.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "20px",
      // Tope de 1120px desde el breakpoint más chico (equivale al .wrap original).
      screens: { sm: "1120px" },
    },
    extend: {
      colors: {
        // Paleta de marca (del logo original)
        rojo: { DEFAULT: "#E8352B", osc: "#B7211A" },
        amarillo: "#FFC61B",
        azul: { DEFAULT: "#1F6FD0", osc: "#144E96" },
        verde: { DEFAULT: "#23B15D", osc: "#158245" },
        rosa: "#FF7AA2",
        cielo: { DEFAULT: "#C9E9FF", osc: "#A5D6F7" },
        papel: "#FFFDF6",
        tinta: "#1B1310",
        gris: "#8D7F76",

        // Tokens semánticos shadcn/ui (mapeados a CSS vars)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        display: ['"Bagel Fat One"', "cursive"],
        alt: ['"Baloo 2"', "sans-serif"],
        body: ['"Fredoka"', "sans-serif"],
      },
      borderWidth: {
        3: "3px",
      },
      borderRadius: {
        lg: "var(--radio)",
        md: "calc(var(--radio) - 4px)",
        sm: "calc(var(--radio) - 8px)",
      },
      boxShadow: {
        // Sombras duras desplazadas, sin blur
        hard: "6px 6px 0 var(--tinta)",
        "hard-sm": "4px 4px 0 var(--tinta)",
        "hard-lg": "10px 10px 0 var(--tinta)",
        "hard-xl": "12px 12px 0 var(--tinta)",
        "hard-hover": "8px 8px 0 var(--tinta)",
      },
      keyframes: {
        flota: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        rodar: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        menuPop: {
          from: { transform: "translateY(-8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        flota: "flota 5.5s ease-in-out infinite",
        rodar: "rodar 22s linear infinite",
        menuPop: "menuPop .18s ease both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
