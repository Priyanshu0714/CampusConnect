/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{ejs,js}", "./public/**/*.{ejs,js}"],
  theme: {
    extend: {
      fontFamily: {
        custom: ['MyCustomFont', 'sans-serif'],
        northwellfont:['northwellfont','sans-serif'],
        poppins:['poppins','sans-serif'],
        poppinsBold:['poppins-BOLD','sans-serif']
      },
    },
  },
  plugins: [],
};
