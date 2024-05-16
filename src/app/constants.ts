
import { envConfig } from '../config/envConfig';
const env = import.meta.env;

export const API_URL = `${env.SITE}${env.BASE_URL}api/`;


export const REMOTE_ASSETS_BASE_URL = `https://flowbite-admin-dashboard.vercel.app`;

export const SITE_TITLE = `${envConfig.PLATFORM_DATA.name} - Self-Sovereign Identity Platform`;

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

