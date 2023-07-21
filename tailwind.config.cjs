/* eslint-disable global-require */
/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
		'./node_modules/flowbite/**/*.js',
		'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
	],

	darkMode: 'class',

	theme: {
		extend: {
			colors: {
				accentColor: '#20acdf',
				
				primary: {  
					DEFAULT: '#3558A8',  
					50: '#EDF1F9',  
					100: '#DDE4F4', 
					200: '#BECCEB', 
					300: '#9FB3E1',  
					400: '#809BD7',  
					500: '#6182CD',  
					600: '#426AC3',  
					700: '#3558A8',  
					800: '#28427D',  
					900: '#1A2B53',  
					950: '#13203D'
				},
			},
			fontFamily: {
				sans: [
					...defaultTheme.fontFamily.sans,
					'Inter var', 
					'ui-sans-serif',
					'system-ui',
					'-apple-system',
					'system-ui',
					'Segoe UI',
					'Roboto',
					'Helvetica Neue',
					'Arial',
					'Noto Sans',
					'sans-serif',
					'Apple Color Emoji',
					'Segoe UI Emoji',
					'Segoe UI Symbol',
					'Noto Color Emoji',
				],
				body: [
					'Inter',
					'ui-sans-serif',
					'system-ui',
					'-apple-system',
					'system-ui',
					'Segoe UI',
					'Roboto',
					'Helvetica Neue',
					'Arial',
					'Noto Sans',
					'sans-serif',
					'Apple Color Emoji',
					'Segoe UI Emoji',
					'Segoe UI Symbol',
					'Noto Color Emoji',
				],
				mono: [
					'ui-monospace',
					'SFMono-Regular',
					'Menlo',
					'Monaco',
					'Consolas',
					'Liberation Mono',
					'Courier New',
					'monospace',
				],
			},
			transitionProperty: {
				width: 'width',
			},
			textDecoration: ['active'],
			minWidth: {
				kanban: '28rem',
			},
		},
	},

	safelist: [
		// In Markdown (README…)
		'justify-evenly',
		'overflow-hidden',
		'rounded-md',

		// From the Hugo Dashboard
		'w-64',
		'w-1/2',
		'rounded-l-lg',
		'rounded-r-lg',
		'bg-gray-200',
		'grid-cols-4',
		'grid-cols-7',
		'h-6',
		'leading-6',
		'h-9',
		'leading-9',
		'shadow-lg',
		'bg-opacity-50',
		'dark:bg-opacity-80',

		// For Astro one
		'grid',
	],

	plugins: [
		require('flowbite/plugin'),
		require('flowbite-typography'),
		require('tailwind-scrollbar')({ nocompatible: true }),
	],
};
