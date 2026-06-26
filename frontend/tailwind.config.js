module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        saffron: "#d97706",
        pine: "#0f3d2e",
        cedar: "#214f3c",
        snow: "#f8f5ef",
        walnut: "#4a3428",
        mist: "#dce7e1",
        // Luxury Theme Colors
        gold: "#D4AF63",
        muted: "#B7B7B7",
        dark: {
          900: "#090909",
          800: "#0F0F0F",
          700: "#131313",
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"]
      },
      boxShadow: {
        card: "0 18px 50px rgba(30, 41, 59, 0.12)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top, rgba(217, 119, 6, 0.2), transparent 38%), linear-gradient(180deg, #0f3d2e 0%, #123524 48%, #f8f5ef 100%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        rise: "rise 0.7s ease-out"
      }
    }
  },
  plugins: []
};
