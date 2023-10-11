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
				accentColor: '#20ACDF',

				primary: {
					DEFAULT: '#1F4EAD',
					50: '#DCE6F9',
					100: '#CBD9F6',
					200: '#A9C0F0',
					300: '#86A7E9',
					400: '#638EE3',
					500: '#4174DD',
					600: '#255ED0',
					700: '#1F4EAD',
					800: '#16397D',
					900: '#0E234E',
					950: '#0A1836'
				},

				secondary: {
					DEFAULT: '#D6F5F5',
					50: '#FFFFFF',
					100: '#FFFFFF',
					200: '#FFFFFF',
					300: '#FFFFFF',
					400: '#FFFFFF',
					500: '#FFFFFF',
					600: '#F7FDFD',
					700: '#D6F5F5',
					800: '#A9EAEA',
					900: '#7CDFDF',
					950: '#65DADA'
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
			maxWidth: {
				'100/6rem': 'calc(100% - 6rem)'
			},
			minHeight: {
				'100/18rem': 'calc(100vh - 18rem)',
				'100/25rem': 'calc(100vh - 25rem)'
			},
			scale: {
				'103': '1.03',
			}
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
