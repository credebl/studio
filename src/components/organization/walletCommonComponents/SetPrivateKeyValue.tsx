import { Checkbox, Label } from 'flowbite-react';
import { Field } from 'formik';
import { useEffect, useState, type ChangeEvent } from 'react';
import GenerateBtnPolygon from './GenerateBtnPolygon';
import { getFromLocalStorage } from '../../../api/Auth';
import { apiStatusCodes, storageKeys } from '../../../config/CommonConstant';
import { createPolygonKeyValuePair } from '../../../api/Agent';
import type { AxiosResponse } from 'axios';
import TokenWarningMessage from './TokenWarningMessage';
import CopyDid from '../../../commonComponents/CopyDid';
import type { IPolygonKeys } from './interfaces';
import { ethers } from 'ethers';
import { envConfig } from '../../../config/envConfig';
import { CommonConstants, Network } from '../../../common/enums';
interface IProps {
	setPrivateKeyValue: (val: string) => void
	privateKeyValue: string | undefined
	formikHandlers: {
		handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
		handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
		errors: {
			privatekey?: string;
		};
		touched: {
			privatekey?: boolean;
		};
	};
}

const SetPrivateKeyValueInput = ({
	setPrivateKeyValue,
	privateKeyValue,
	formikHandlers,
}: IProps) => {
	const [havePrivateKey, setHavePrivateKey] = useState(false);
	const [generatedKeys, setGeneratedKeys] = useState<IPolygonKeys | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const checkWalletBalance = async (privateKey: string, network: Network) => {
		try {
			const rpcUrls = {
				testnet: `${envConfig.PLATFORM_DATA.polygonTestnet}`,
				mainnet: `${envConfig.PLATFORM_DATA.polygonMainnet}`
			};

			const networkUrl = rpcUrls?.[network];

			const provider = new ethers.JsonRpcProvider(networkUrl);

			const wallet = new ethers.Wallet(privateKey, provider);
			const address = await wallet.getAddress();
			const balance = await provider.getBalance(address);

			const etherBalance = ethers.formatEther(balance);

			if (parseFloat(etherBalance) < CommonConstants.BALANCELIMIT) {
				setErrorMessage('You have insufficient funds.');
			} else {
				setErrorMessage(null);
			}

			return etherBalance;
		} catch (error) {
			console.error('Error checking wallet balance:', error);
			return null;
		}
	};

	useEffect(() => {
		if (privateKeyValue && privateKeyValue.length === 64) {
			checkWalletBalance(privateKeyValue, Network.TESTNET);
		} else {
			setErrorMessage(null);
		}

	}, [privateKeyValue]);

	useEffect(() => {
		if (havePrivateKey) {
			setPrivateKeyValue('');
			setErrorMessage(null);
			setGeneratedKeys(null);
		} else {
			setPrivateKeyValue('');
			setErrorMessage(null);
		}
	}, [havePrivateKey]);

	const generatePolygonKeyValuePair = async () => {
		setLoading(true);
		try {
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			const resCreatePolygonKeys = await createPolygonKeyValuePair(orgId);
			const { data } = resCreatePolygonKeys as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				setGeneratedKeys(data?.data);
				setLoading(false);
				const privateKey = data?.data?.privateKey.slice(2)
				setPrivateKeyValue(privateKey || privateKeyValue);
				await checkWalletBalance(privateKey || privateKeyValue, Network.TESTNET);
			}
		} catch (err) {
			console.error('Generate private key ERROR::::', err);
		}
	};

	return (
		<div className="mb-3 relative">
			<div className="flex items-center gap-2 mt-4">
				<Checkbox
					id="havePrivateKey"
					onChange={(e) => setHavePrivateKey(e.target.checked)} />
				<Label className="flex" htmlFor="havePrivateKey">
					<p>Already have a private key?</p>
				</Label>
			</div>
			{!havePrivateKey ? (
				<>
					<GenerateBtnPolygon generatePolygonKeyValuePair={() => generatePolygonKeyValuePair()} loading={loading} />

					{generatedKeys && (
						<>
							<div className="mt-3 relative flex items-center">
								<Field
									type="text"
									id="privatekey"
									name="privatekey"
									className="truncate bg-gray-50 border mt-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[480px] p-2.5 dark:bg-gray-700 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
									value={generatedKeys.privateKey.slice(2)}
									placeholder="Generated private key"
									readOnly />

								<div className='mt-4'>
									<CopyDid
										className="align-center hidden text-sm text-gray-900 dark:text-white truncate mt-8"
										value={generatedKeys.privateKey.slice(2)}
									/>
								</div>

							</div>
							<div>
								{errorMessage && (
									<span className="static bottom-0 text-red-500 text-xs">
										{errorMessage}
									</span>
								)}

							</div>
							<TokenWarningMessage />

							<div className="my-3 relative">
								<p className="text-sm truncate">
									<span className="font-semibold text-gray-900 dark:text-white">
										Address:
									</span>
									<div className="flex">
										<CopyDid
											className="align-center block text-sm text-gray-900 dark:text-white truncate"
											value={generatedKeys.address} />
									</div>
								</p>
							</div>

						</>
					)}
				</>
			) : (
				<>
					<div className="mt-3 relative flex items-center">

						<Field
							type="text"
							id="privatekey"
							name="privatekey"
							className="truncate bg-gray-50 border mt-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-[480px] block p-2.5 dark:bg-gray-700 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
							value={privateKeyValue}
							onChange={(e: ChangeEvent<HTMLInputElement>) => {
								setPrivateKeyValue(e.target.value);
								formikHandlers.handleChange(e);
							}}
							onBlur={formikHandlers.handleBlur}
							placeholder="Enter private key" />

						<div className='mt-4'>
							<CopyDid
								className="align-center hidden text-sm text-gray-900 dark:text-white truncate mt-8"
								value={privateKeyValue}
							/>
						</div>
					</div>
					<span className="static bottom-0 text-red-500 text-xs">
						{formikHandlers.errors?.privatekey &&
							formikHandlers.touched?.privatekey &&
							formikHandlers.errors.privatekey}
					</span>

					{errorMessage && (
						<span className="static bottom-0 text-red-500 text-xs">
							{errorMessage}
						</span>
					)}

					<div>
						<TokenWarningMessage />

					</div>

				</>
			)}
		</div>


	);
};
export default SetPrivateKeyValueInput;
