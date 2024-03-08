import createWallet from '../assets/shared.svg';
const env = import.meta.env || process.env;

export const API_URL = `${env.SITE}${env.BASE_URL}api/`;

const { PUBLIC_PLATFORM_NAME, PUBLIC_PLATFORM_LOGO, PUBLIC_POWERED_BY, PUBLIC_PLATFORM_WEB_URL, PUBLIC_POWERED_BY_URL, PUBLIC_PLATFORM_DOCS_URL, PUBLIC_PLATFORM_GIT, PUBLIC_PLATFORM_SUPPORT_EMAIL,PUBLIC_PLATFORM_TWITTER_URL, PUBLIC_PLATFORM_SUPPORT_INVITE, PUBLIC_PLATFORM_DISCORD_URL}: any = globalThis || env;


export const PLATFORM_DATA = {
	name:
		PUBLIC_PLATFORM_NAME || env.PUBLIC_PLATFORM_NAME,
	logo:
		PUBLIC_PLATFORM_LOGO || env.PUBLIC_PLATFORM_LOGO,
	poweredBy:
		PUBLIC_POWERED_BY || env.PUBLIC_POWERED_BY,
	webUrl:
		PUBLIC_PLATFORM_WEB_URL ||
		env.PUBLIC_PLATFORM_WEB_URL,
	orgUrl:
		PUBLIC_POWERED_BY_URL ||
		env.PUBLIC_POWERED_BY_URL,
	docs:
		PUBLIC_PLATFORM_DOCS_URL ||
		env.PUBLIC_PLATFORM_DOCS_URL,
	git:
		PUBLIC_PLATFORM_GIT ||
		env.PUBLIC_PLATFORM_GIT,
	support:
    PUBLIC_PLATFORM_SUPPORT_EMAIL ||
	env.PUBLIC_PLATFORM_SUPPORT_EMAIL,

        twitter:
        PUBLIC_PLATFORM_TWITTER_URL ||
		env.PUBLIC_PLATFORM_TWITTER_URL,
        discord:
        PUBLIC_PLATFORM_DISCORD_URL ||
		env.PUBLIC_PLATFORM_DISCORD_URL,
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
