/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // A dim projection room: warm charcoal surfaces, paper-coloured text and a marquee-amber accent.
        primary: "#F2A93B",
        error: "#F28B82",
        backgroundColor: "#15110E",
        cardColor: "#1F1914",
        inputColor: "#2A221C",
        ink: "#F5EDE0",
        muted: "#B9AC9A",
        line: "#8A7B69",
      },
      fontFamily: {
        display: ['"Young Serif"', "Georgia", "serif"],
        sans: ['"Instrument Sans"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
