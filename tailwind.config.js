// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Backgrounds
        cream: {
          DEFAULT: "#FBF7EF", // modal background
          100: "#EFE7D4",     // image placeholder bg
          200: "#F3ECD8",     // dropdown hover
        },
        // Borders
        sand: {
          DEFAULT: "#E7DCC5", // light borders/dividers
          dark: "#D8CBA9",    // dashed upload border, cancel border
        },
        // Text
        ink: {
          DEFAULT: "#2B2B24", // primary text
          muted: "#5B5A4E",   // secondary text/icons
          soft: "#7A7862",    // tertiary text/icons
          faint: "#9A987F",   // placeholder text
        },
        // Brand accent (forest green)
        forest: {
          DEFAULT: "#2F4B3C", // primary accent / buttons
          dark: "#24392D",    // hover state
        },
        // Error
        clay: {
          DEFAULT: "#8C3A22", // error text
          light: "#F7E4DC",   // error background
        },
      },
    },
  },
};