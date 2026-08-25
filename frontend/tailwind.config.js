/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // A small brand palette so components read clearly.
        brand: {
          DEFAULT: "#4f46e5", // indigo-600
          dark: "#4338ca",
        },
      },
    },
  },
  plugins: [],
};
