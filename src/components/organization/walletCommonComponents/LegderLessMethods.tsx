import { DidMethod } from '../.././../common/enums';
import type { FormikProps } from "formik";
import type { IValuesShared } from "./interfaces";

interface IProps {
    formikHandlers: FormikProps<IValuesShared>;
    setSelectedDid: (val: string) => void;
    selectedDid: string;
    mappedData: null | object;
    selectedLedger: string;
    selectedNetwork: string;
}

const LedgerLessMethodsComponent = ({ formikHandlers, setSelectedDid, selectedDid, mappedData, selectedLedger, selectedNetwork }: IProps) => {

    return (
			<div className="my-3 relative">
				<label
					htmlFor="network"
					className="text-sm font-medium text-gray-900 dark:text-gray-300"
				>
					Network
					<span className="text-red-500 text-xs">*</span>
				</label>

				<select
					onChange={(e) => {
						formikHandlers.handleChange(e);
						setSelectedDid(e.target.value);
					}}
					value={selectedDid}
					id="network"
					name="network"
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
				>
					<option value="">Select Network</option>
					{formikHandlers.values.method === DidMethod.POLYGON &&
						mappedData &&
						Object.keys(mappedData[selectedLedger])?.map((network) => (
							<option key={network} value={network}>
									{network.charAt(0).toUpperCase() + network.slice(1)}{' '}
							</option>
						))}
					{formikHandlers.values.method !== DidMethod.POLYGON &&
						mappedData &&
						selectedLedger &&
						selectedNetwork &&
						Object.keys(mappedData[selectedLedger][selectedNetwork])?.map(
							(network) => (
								<option key={network} value={network}>
									{network.charAt(0).toUpperCase() + network.slice(1)}{' '}
								</option>
							),
						)}
				</select>

				{formikHandlers?.errors?.network &&
					formikHandlers?.touched?.network && (
						<span className="absolute botton-0 text-red-500 text-xs">
							{formikHandlers?.errors?.network}
						</span>
					)}
			</div>
		);

}
export default LedgerLessMethodsComponent;