/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                'teal-brand': {
                    950: '#03181b',
                    900: '#052429',
                    850: '#072d33',
                    800: '#0a383f',
                    700: '#0e4851',
                    600: '#145e69',
                    500: '#1c7986',
                },
                'accent-green': {
                    DEFAULT: '#00e575',
                    hover: '#00cb68',
                    light: '#e6fcf1',
                    dark: '#008742',
                },
                'urgent-red': {
                    DEFAULT: '#ef4444',
                    bg: '#fef2f2',
                    border: '#fecaca',
                },
                'priority-orange': {
                    DEFAULT: '#f97316',
                    bg: '#fff7ed',
                    border: '#fed7aa',
                },
                'routine-green': {
                    DEFAULT: '#10b981',
                    bg: '#ecfdf5',
                    border: '#a7f3d0',
                },
                'review-amber': {
                    DEFAULT: '#f59e0b',
                    bg: '#fffbeb',
                    border: '#fde68a',
                },
                surface: {
                    DEFAULT: '#ffffff',
                    subtle: '#f8fafc',
                    card: '#ffffff',
                }
            }
        },
    },
    plugins: [],
}
