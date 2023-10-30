import createWallet from '../assets/shared.svg';
const env = import.meta.env;

export const API_URL = `${env.SITE}${env.BASE_URL}api/`;

export const PLATFORM_DATA = {
	name:
		globalThis.PUBLIC_PLATFORM_NAME || env.PUBLIC_PLATFORM_NAME || 'CREDEBL',
	logo:
		globalThis.PUBLIC_PLATFORM_LOGO ||
		env.PUBLIC_PLATFORM_LOGO ||
		'/images/CREDEBL_ICON.png',
	poweredBy:
		globalThis.PUBLIC_POWERED_BY ||
		env.PUBLIC_POWERED_BY ||
		'Blockster Labs Pvt. Ltd.',
	webUrl:
		globalThis.PUBLIC_PLATFORM_WEB_URL ||
		env.PUBLIC_PLATFORM_WEB_URL ||
		'https://credebl.id/',
	orgUrl:
		globalThis.PUBLIC_POWERED_BY_URL ||
		env.PUBLIC_POWERED_BY_URL ||
		'https://blockster.global',
	docs:
		globalThis.PUBLIC_PLATFORM_DOCS_URL ||
		env.PUBLIC_PLATFORM_DOCS_URL ||
		'https://docs.credebl.id',
	git:
		globalThis.PUBLIC_PLATFORM_GIT ||
		env.PUBLIC_PLATFORM_GIT ||
		'https://github.com/credebl',
	support:
		globalThis.PUBLIC_PLATFORM_SUPPORT ||
		env.PUBLIC_PLATFORM_SUPPORT ||
		'https://discord.gg/w4hnQT7NJ',
	supportInvite:
		globalThis.PUBLIC_PLATFORM_SUPPORT_INVITE ||
		env.PUBLIC_PLATFORM_SUPPORT_INVITE ||
		'https://discord.com/invite/w4hnQT7NJG',
	images: [
		{
			id: 'create_wallet',
			image: createWallet,
		},
	],
};

export const REMOTE_ASSETS_BASE_URL = `https://flowbite-admin-dashboard.vercel.app`;

export const SITE_TITLE = `${PLATFORM_DATA.name} - Self-Sovereign Identity Platform`;

/* Useful flag for sourcing from `./data` entirely, disabling randomize layer */
export const RANDOMIZE = Boolean(env.RANDOMIZE) || true;

// NOTE: Unmapped
// export const SIDEBAR = [
// 	{
// 		title: 'Getting started',
// 		pages: [
// 			{ title: 'Introduction' },
// 			{ title: 'Quickstart' },
// 			{ title: 'Build tools' },
// 			{ title: 'License' },
// 			{ title: 'Changelog' },
// 		],
// 	},
// 	{
// 		title: 'Customize',
// 		pages: [
// 			{ title: 'Configuration' },
// 			{ title: 'Theming' },
// 			{ title: 'Color' },
// 			{ title: 'Icons' },
// 			{ title: 'Optimization' },
// 		],
// 	},
// 	{
// 		title: 'Components',
// 		pages: [
// 			{ title: 'Alerts' },
// 			{ title: 'Badge' },
// 			{ title: 'Breadcrumb' },
// 			{ title: 'Buttons' },
// 			{ title: 'Button group' },
// 			{ title: 'Card' },
// 			{ title: 'Dropdowns' },
// 			{ title: 'Forms' },
// 			{ title: 'Typography' },
// 			{ title: 'Modal' },
// 			{ title: 'Navbar' },
// 			{ title: 'Pagination' },
// 			{ title: 'Progress' },
// 			{ title: 'Tables' },
// 			{ title: 'Tooltips' },
// 		],
// 	},
// ];
