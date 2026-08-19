/* Tailwind Play CDN theme.
   Must load AFTER https://cdn.tailwindcss.com — the CDN reads this and
   rebuilds its stylesheet when the config changes. */

tailwind.config = {
  theme: {
    extend: {
      colors: {
        forest: {
          900: "#0A2540",
          800: "#0E3358",
          700: "#134B7C",
          600: "#2C6FA8",
        },
        /* DEFAULT = fills & plates, light = text on dark, dark = text on light */
        lime: { DEFAULT: "#38BDF8", light: "#7DD3FC", dark: "#0B6BD3" },
        mint: "#BAE6FD",
        paper: "#F3F8FE",
        line: "#DCE8F5",
        haze: "#93A9C6",
        ink: "#17293D",
      },
      fontFamily: {
        display: ['"DM Sans"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: { card: "8px", panel: "24px" },
      boxShadow: {
        card: "0 4px 13.9px 0 rgba(0,0,0,0.05)",
        lift: "0 14px 34px -12px rgba(10, 37, 64,0.16)",
      },
      maxWidth: { edge: "1340px" },
    },
  },
};
