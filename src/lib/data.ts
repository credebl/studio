// NOTE: This is where you could wire up your own data providers:
// GraphQL, Databases, REST APIs, CDNs, proxies, S3, Matrix, IPFS, you name it…

import { API_URL, REMOTE_ASSETS_BASE_URL } from '../app/constants.js';
import { DidMethod, Environment, Network } from '../common/enums.js';
import type { Endpoint, EndpointsToOperations } from '../types/entities.js';

export async function fetchData<Selected extends Endpoint>(endpoint: Selected) {
	const apiEndpoint = `${API_URL}${endpoint}`;

	console.info(`Fetching ${apiEndpoint}…`);
	return fetch(apiEndpoint)
		.then(
			(r) =>
				r.json() as unknown as Promise<
					ReturnType<EndpointsToOperations[Selected]>
				>,
		)
		.catch((e) => {
			console.error(e);
			throw Error('Invalid API data!');
		});
}

// NOTE: These helpers are useful for unifying paths, app-wide
export function url(path = '') {
	return `${import.meta.env.SITE}${import.meta.env.BASE_URL}${path}`;
}

// TODO: Remove old local assets from git history (to make cloning snappier).
export function asset(path: string) {
	// NOTE: Fetching remote assets from the Hugo admin dashboard Vercel dist.
	return `${REMOTE_ASSETS_BASE_URL}/${path}`;
}

export const getFilteredNetworks = (
	networks: string[],
	envMode: Environment,
	selectedMethod: string
  ): string[] => {
	if (envMode === Environment.Prod && selectedMethod === DidMethod.POLYGON) {
	  return networks.filter(network => network === Network.MAINNET);
	} else if (
	  (envMode === Environment.Dev || envMode === Environment.Qa) &&
	  selectedMethod === DidMethod.POLYGON
	) {
	  return networks.filter(network => network === Network.TESTNET);
	}
	return networks;
  };
  
