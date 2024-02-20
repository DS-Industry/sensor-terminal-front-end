/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    colors: {
      primary: "#0045FF",
      secondary: "#7EADFF",
      black: "#000",
      blue: {
        100: "#BCD2FC",
        200: "#B6E5FF",
        500: "#1252FD",
        550: "#4D7BF6",
        600: "#0167FF",
        650: "#537FF4",
        700: "#0153FF",
      },
      white: {
        500: "#FFF",
        600: "#F5F5F5",
      },
      green: {
        400: "#4CC98B",
        500: "#66B600",
        600: "#26C074",
      },
      red: {
        400: "#FF4F76",
        500: "#FF0000",
      },
      gray: {
        500: "#bababa",
        600: "#838A8F",
      },
    },
    extend: {},
  },
  plugins: [],
};
