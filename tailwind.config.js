/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: "#3D1152",
          tint: "#EDE0F5",
        },
        tangerine: {
          DEFAULT: "#FF6B2B",
          tint: "#FFF0E8",
        },
        parchment: "#FAF7F5",
        surface: "#FFFFFF",
        income: {
          DEFAULT: "#1A7A4A",
          tint: "#E6F5EE",
        },
        expense: {
          DEFAULT: "#C13333",
          tint: "#FCEAEA",
        },
        text: {
          primary: "#1C0F2E",
          secondary: "#8C7A9B",
        },
        border: "#EAE3F0",
      },
      fontSize: {
        "screen-title": ["20px", { fontWeight: "500" }],
        "section-heading": ["14px", { fontWeight: "500" }],
        body: ["14px", { fontWeight: "400" }],
        secondary: ["12px", { fontWeight: "400" }],
        "amount-lg": ["48px", { fontWeight: "500" }],
        "amount-md": ["32px", { fontWeight: "500" }],
        "amount-list": ["14px", { fontWeight: "500" }],
        caption: ["11px", { fontWeight: "400" }],
        "button-label": ["14px", { fontWeight: "500" }],
      },
    },
  },
  plugins: [],
};
