/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Comic Sans MS"', '"Chalkboard SE"', '"Comic Neue"', 'cursive', 'sans-serif']
			}
		}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			{
				wrigs: {
					primary: '#FFF8B8', // Lemon Meringue - soft yellow
					secondary: '#FFE9C5', // Lemon Meringue - warm cream
					accent: '#FFD4E5', // Lemon Meringue - light pink
					neutral: '#3D4451',
					'base-100': '#FFFFFF',
					info: '#60A5FA', // Blue
					success: '#D0F0C0', // Lemon Meringue - mint green
					warning: '#FB923C', // Orange
					error: '#F87171'
				}
			}
		]
	}
};
