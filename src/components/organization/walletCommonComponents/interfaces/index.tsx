export interface IValues {
	seed: string;
	walletName: string;
	password: string;
	did: string;
	network: string;
}

export interface IDedicatedAgentForm {
	seeds: string;
	loading: boolean;
	submitDedicatedWallet: (values: IValues) => void;
}

export interface IValuesShared {
	keyType: string;
	seed: string;
	method: string;
	network?: string;
	did?: string;
	endorserDid?: string;
	privatekey?: string;
	endpoint?: string;
	domain?: string;
	role?: string;
	ledger: string;
	label: string;
}

export interface INetworks {
	id: number;
	name: string;
}

export interface IPolygonKeys {
	privateKey: string;
	publicKeyBase58: string;
	address: string;
}

export interface ISharedAgentForm {
	seeds: string;
	isCopied: boolean;
	orgName: string;
	loading: boolean;
	submitSharedWallet: (
		values: IValuesShared,
		privatekey: string,
		domain: string,
		endPoint: string,
	) => void;
}


