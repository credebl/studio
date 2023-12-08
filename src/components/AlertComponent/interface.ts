export interface IAlertComponent {
	message: string | null;
	type: string;
	viewButton?: boolean;
	path?: string;
	onAlertClose: () => void;
}
