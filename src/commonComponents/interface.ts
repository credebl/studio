export interface IProps {
	openModal: boolean;
	closeModal: (flag: boolean) => void;
	onSuccess: (flag: boolean) => void;
	message: string;
	isProcessing: boolean;
	success: string | null;
	failure: string | null;
	setFailure: (flag: string | null) => void;
	setSuccess: (flag: string | null) => void;
}
