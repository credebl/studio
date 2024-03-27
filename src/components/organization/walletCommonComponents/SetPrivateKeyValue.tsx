import {Label } from 'flowbite-react';
import { Field} from 'formik';
interface IProps {
    setPrivateKeyValue:(val:string)=>void
    privateKeyValue:string
    formikHandlers: {
        handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    };
}

const SetPrivateKeyValueInput = ({
	setPrivateKeyValue,
	privateKeyValue,
	formikHandlers,
}: IProps) => (
	<>
		<div className="my-3 relative">
			<div className="mt-4">
				<Label value="Private Key" />
				<span className="text-red-500 text-xs">*</span>
			</div>
		</div>
		<Field
			id="privatekey"
			name="privatekey"
			className="truncate bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
			value={privateKeyValue}
			onChange={(e) => {
				setPrivateKeyValue(e.target.value);
				formikHandlers.handleChange(e);
			}}
			onBlur={formikHandlers.handleBlur}
			placeholder="Enter private key"
		/>
		<span className="static bottom-0 text-red-500 text-xs">
			{formikHandlers.errors?.privatekey &&
				formikHandlers.touched?.privatekey &&
				formikHandlers.errors.privatekey}
		</span>
	</>
);
export default SetPrivateKeyValueInput;
