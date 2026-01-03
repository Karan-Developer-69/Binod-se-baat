/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        color1: "#061E29",
        color2: "#1D546D",
        color3: "#5F9598",
        color4: "#F3F4F4",
      },
    },
  },
  plugins: [],
};