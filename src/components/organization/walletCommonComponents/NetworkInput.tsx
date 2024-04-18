import { Label } from "flowbite-react";
import type { INetworks } from "./interfaces";

const NetworkInput = ({ formikHandlers }) => {
	return (
		<div>
			<div className="mb-1 block">
				<Label htmlFor="network" value="Network" />
				<span className="text-red-500 text-xs">*</span>
			</div>

			<select
				onChange={(e) => formikHandlers.handleChange(e)}
				id="network"
				name="network"
				className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
			>
				<option value="">Select network</option>
				{networks &&
					networks.length > 0 &&
					networks.map((item: INetworks) => (
						<option key={item.id} value={item.id}>
							{item.name}
						</option>
					))}
			</select>

			{formikHandlers?.errors?.network && formikHandlers?.touched?.network && (
				<span className="text-red-500 text-xs">
					{formikHandlers?.errors?.network}
				</span>
			)}
		</div>
	);
};

export default NetworkInput;
