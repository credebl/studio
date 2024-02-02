export interface passwordValues {

	password: string,
	confirmPassword: string
}

export interface emailValue {
	email: string;
}
export interface nameValues {
	firstName: string;
	lastName: string;
}

export interface IValues {
	currentPassword: string;
	newPassword: string;
	confirmPassword?: string;
}

export interface IPassword {
	currentPassword: boolean;
	newPassword: boolean;
	confirmPassword: boolean;
}

export interface IProps {
	openModel: boolean;
	email: any;
	setOpenModal: (arg0: boolean) => void;
}
