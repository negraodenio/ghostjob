import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    primary: "#0A0A0A",
                    card: "#141414",
                },
                primary: "#8B5CF6",
                success: "#10B981",
                warning: "#F59E0B",
                danger: "#EF4444",
                ghost: "#E2E8F0",
                text: {
                    primary: "#FFFFFF",
                    secondary: "#9CA3AF",
                },
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            animation: {
                "ghost-float": "float 3s ease-in-out infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-20px)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
