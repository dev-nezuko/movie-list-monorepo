/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2BD17E",
        error: "#EB5757",
        backgroundColor: "#093545",
        inputColor: "#224957",
        cardColor: "#092C39",
      },
    },
  },
  plugins: [],
};
