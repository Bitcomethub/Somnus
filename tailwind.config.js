/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./App.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                'tingle-bg': '#0f0c29', // Deep purple / Night blue base
                'tingle-card': '#302b63', // Slightly lighter for cards
                'tingle-accent': '#24243e', // Accent
                'tingle-primary': '#a855f7', // Purple primary
            }
        },
    },
    plugins: [],
}
