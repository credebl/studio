export interface IProps {
	openModal: boolean;
	closeModal: (flag: boolean) => void;
	onSuccess: (flag: boolean) => void;
	message: string;
	isProcessing: boolean;
	success: string | null;
	failure: string | null;
	setFailure: string | null;
	setSuccess: string | null;
}
