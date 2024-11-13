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
	submitDedicatedWallet: (values: IValuesShared, privatekey: string,
		domain: string) => void;
		onConfigureDedicated:() => void,
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
	maskedSeeds: string;
	isCopied: boolean;
	orgName: string;
	loading: boolean;
	submitSharedWallet: (
		values: IValuesShared,
		domain: string
	) => void;
}

export interface ILedgerConfigData {
    indy: {
        'did:indy': {
            [key: string]: string;
        };
    };
    polygon: {
        'did:polygon': {
            [key: string]: string;
        };
    };
    noLedger: {
        [key: string]: string;
    };
}

export interface ILedgerItem {
    name: string;
    details: IDetails;
}
interface IDetails {
    [key: string]: string | { [subKey: string]: string };
}

export interface IDedicatedAgentData {
	walletName: string;
	agentEndpoint: string;
	apiKey: string;
	seed:string;
	keyType:string;
	method:string;
	network:string;
	role:string;
}