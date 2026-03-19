import type { Config } from "tailwindcss";
import { colors, fontFamily, shadows } from "./src/styles/theme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        neutral: colors.neutral,
        success: colors.success,
        warning: colors.warning,
        danger: colors.danger,
      },
      fontFamily: {
        sans: [...fontFamily.sans] as string[],
      },
      boxShadow: {
        card: shadows.card,
        cardHover: shadows.cardHover,
        modal: shadows.modal,
      },
    },
  },
  plugins: [],
};
export default config;
