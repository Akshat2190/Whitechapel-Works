module.exports = {
  darkMode: "class", // Ensure this is set to 'class'
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"], // Ensure paths are correct
  theme: {
    extend: {
      colors: {
        "custom-dark": "#242124",
        "custom-black": "#000000",
      },
    },
  },
  plugins: [],
};
