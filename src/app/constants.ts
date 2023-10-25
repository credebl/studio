import createWallet from '../assets/shared.svg'

export const API_URL = `${import.meta.env.SITE}${import.meta.env.BASE_URL}api/`;

const env = import.meta.env

export const PLATFORM_DATA = {
    name: env.PUBLIC_PLATFORM_NAME || "CREDEBL",
    logo: env.PUBLIC_PLATFORM_LOGO || "/images/CREDEBL_ICON.png",
    poweredBy: env.PUBLIC_POWERED_BY || "Blockster Labs Pvt. Ltd.",
    webUrl: env.PUBLIC_PLATFORM_WEB_URL || "https://credebl.id/",
    orgUrl: env.PUBLIC_POWERED_BY_URL || "https://blockster.global",
    docs: env.PUBLIC_PLATFORM_DOCS_URL || "https://docs.credebl.id",
    git: env.PUBLIC_PLATFORM_GIT || "https://github.com/credebl",
    support: env.PUBLIC_PLATFORM_SUPPORT || "https://discord.gg/w4hnQT7NJ",
    supportInvite: env.PUBLIC_PLATFORM_SUPPORT_INVITE || "https://discord.com/invite/w4hnQT7NJG",
    images: [
        {
            id: "create_wallet",
            image: createWallet
        }
    ]
}

export const REMOTE_ASSETS_BASE_URL = `https://flowbite-admin-dashboard.vercel.app`;

export const SITE_TITLE = `${PLATFORM_DATA.name} - Self-Sovereign Identity Platform`;

/* Useful flag for sourcing from `./data` entirely, disabling randomize layer */
export const RANDOMIZE = Boolean(import.meta.env.RANDOMIZE) || true;

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
