import React from 'react'
import { Helmet } from "react-helmet";
import { envConfig } from '../config/envConfig';

interface IProps {
	generator: string;
	desc: string;
	icon: string;
	sitemap: string;
	siteTitle: string;
	version: string;
}

export const prerender = true

const HelmetHead = ({ generator, desc, icon, sitemap, siteTitle, version }: IProps) => (
	<Helmet>
		<title>{siteTitle} — v{version}</title>
		<meta charSet="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="generator" content={generator} />
		<meta name="description" content={desc} />
		<link rel="icon" type="image/svg+xml" href={icon} />
		<link rel="sitemap" type="application/xml" href={sitemap} />

		<meta name="author" content="Julian Cataldo, Zoltán Szőgyényi, Robert Tanislav" />
		<meta name="copyright" content="MIT" />
		<meta property="og:image" content="https://credebl.id/images/CREDEBL_ICON.png" />
		<meta
			httpEquiv="Content-Security-Policy"
			content="default-src 'self'; script-src 'self';"
		/>
		<meta
			property="og:image"
			content="https://credebl.id/images/CREDEBL_ICON.png"
		/>
		{/* <meta
			http-equiv="Content-Security-Policy"
			content="default-src 'self'; img-src https://*; child-src 'none';" /> */}

		<meta property="og:image" content={envConfig.PLATFORM_DATA.logo} />
	</Helmet>
)

export default HelmetHead