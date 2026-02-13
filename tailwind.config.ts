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
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#ef4444", // Red-500
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#1f2937", // Gray-800
                    foreground: "#ffffff",
                },
                card: {
                    DEFAULT: "#111827", // Gray-900 (slightly lighter than bg)
                    foreground: "#ffffff",
                }
            },
        },
    },
    plugins: [],
};
export default config;
