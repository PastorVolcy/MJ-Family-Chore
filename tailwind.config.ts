import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { ink: "#17211D", cream: "#FFF9EE", mango: "#F4A01C", hibiscus: "#C8453D", leaf: "#466B4D" }, fontFamily: { sans: ["Arial", "sans-serif"] } } }, plugins: [] };
export default config;
