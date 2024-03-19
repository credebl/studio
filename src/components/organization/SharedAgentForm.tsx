import * as yup from 'yup';
import { Button, Checkbox, Label } from 'flowbite-react';
import { Field, Form, Formik, FormikProps } from 'formik';
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import {
	createPolygonKeyValuePair,
	getLedgerConfig,
	getLedgers,
} from '../../api/Agent';
import {
	apiStatusCodes,
	storageKeys,
} from '../../config/CommonConstant';
import { DidMethod } from '../../common/enums';
import type { AxiosResponse } from 'axios';
import { getFromLocalStorage } from '../../api/Auth';
import CopyDid from '../../commonComponents/CopyDid';
import GenerateBtnPolygon from './walletCommonComponents/GenerateBtnPolygon';
import SetPrivateKeyValue from './walletCommonComponents/SetPrivateKeyValue';
import SetDomainValueInput from './walletCommonComponents/SetDomainValueInput';
import TokenWarningMessage from './walletCommonComponents/TokenWarningMessage';
import LedgerLessMethodsComponents from './walletCommonComponents/LegderLessMethods'


export interface ValuesShared {
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

interface ISharedAgentForm {
	seeds: string;
	isCopied: boolean;
	copyTextVal: (e: any) => void;
	orgName: string;
	loading: boolean;
	submitSharedWallet: (
		values: ValuesShared,
		privateKey: string,
		domain: string,
		endPoint: string,
	) => void;
}

interface IPolygonKeys {
	privateKey: string;
	publicKeyBase58: string;
	address: string;
}

interface SelectFieldProps {
    id: string;
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    options: string[] | null;
    error?: string | undefined;
    touched?: boolean | undefined;
  }

const SharedAgentForm = ({
	orgName,
	seeds,
	loading,
	submitSharedWallet,
}: ISharedAgentForm) => {
	const [haveDidShared, setHaveDidShared] = useState(false);
	const [selectedLedger, setSelectedLedger] = useState('');
	const [seedVal, setSeedVal] = useState('');
	const [selectedNetwork, setSelectedNetwork] = useState('');
	const [selectedDid, setSelectedDid] = useState('');
	const [mappedData, setMappedData] = useState(null);
	const [generatedKeys, setGeneratedKeys] = useState<IPolygonKeys | null>(null);
	const [domainValue, setDomainValue] = useState<string>('');
	const [endPointValue, setEndPointValue] = useState<string>('');
	const [privateKeyValue, setPrivateKeyValue] = useState<string>('');


    const SelectField: React.FC<SelectFieldProps> = ({
        id,
        label,
        name,
        value,
        onChange,
        options,
        error,
        touched,
      }) => {
        return (
          <div className="mb-3 relative" id={id}>
            <label htmlFor={name} className="text-sm font-medium text-gray-900 dark:text-gray-300">
              {label}
              {touched && error && <span className="text-red-500 text-xs">*</span>}
            </label>
            <select
              onChange={onChange}
              value={value}
              id={name}
              name={name}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
            >
              <option value="">{`Select ${label}`}</option>
              {options && options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {touched && error && (
              <span className="absolute botton-0 text-red-500 text-xs">
                {error}
              </span>
            )}
          </div>
        );
      };
      
	const fetchLedgerConfig = async () => {
		try {
			const { data } = await getLedgerConfig();
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const obj = {};
				data.data.forEach((item) => {
					obj[item.name.toLowerCase()] = { ...item.details };
				});
				setMappedData(obj);
			}
		} catch (err) {
			console.log('Fetch Network ERROR::::', err);
		}
	};

    const selectDidMethod = async (
			e: React.ChangeEvent<HTMLSelectElement>,
			formikHandlers: FormikProps<ValuesShared>,
		) => {
			formikHandlers.handleChange(e);
			handleLedgerChange(e);
			setSeedVal(seeds);
			setSelectedNetwork('');
			setSelectedDid('');
			setGeneratedKeys(null);
		};

        const selectDidLedger = async (
					e: React.ChangeEvent<HTMLSelectElement>,
					formikHandlers: FormikProps<ValuesShared>,
				) => {
					formikHandlers.handleChange(e);
					setSelectedNetwork(e.target.value);
					setSelectedDid('');
				};
	

	const handleLedgerChange = (e) => {
		setSelectedLedger(e.target.value);
		setSelectedNetwork('');
		setSelectedDid('');
	};

	const generatePolygonKeyValuePair = async () => {
		try {
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			const resCreatePolygonKeys = await createPolygonKeyValuePair(orgId);
			const { data } = resCreatePolygonKeys as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				setGeneratedKeys(data?.data);
			}
		} catch (err) {
			console.log('Generate private key ERROR::::', err);
		}
	};

	useEffect(() => {
		fetchLedgerConfig();
	}, []);

	useEffect(() => {
		setSeedVal(seeds)
	}, [seeds])

	const showMethod = (method: string): ReactElement => {
		switch (method) {
			case DidMethod.POLYGON: {
				return mappedData && selectedLedger && selectedDid ? (
					<span>{mappedData[selectedLedger][selectedDid] || ''}</span>
				) : (
					<></>
				);
			}
			case DidMethod.INDY: {
				return mappedData &&
					selectedLedger &&
					selectedNetwork &&
					selectedDid ? (
					<span>
						{mappedData[selectedLedger][selectedNetwork][selectedDid] || ''}
					</span>
				) : (
					<></>
				);
			}

			case DidMethod.KEY:
			case DidMethod.WEB: {
				return mappedData && selectedLedger ? (
					<span>{mappedData[selectedLedger][selectedLedger] || ''}</span>
				) : (
					<></>
				);
			}
			default:
				return <></>;
		}
	};

	const validations = {
		label: yup.string().required('Wallet label is required'),
		method: yup.string().required('Method is required'),
		...(DidMethod.INDY === selectedLedger || DidMethod.POLYGON === selectedLedger) && { network: yup.string().required('Network is required') },
		...(DidMethod.INDY === selectedLedger) && { ledger: yup.string().required('Ledger is required') },
	}

	return (
		<div className="mt-4 max-w-lg flex-col gap-4">
			<div className="flex items-center gap-2 mt-4">
				<Checkbox
					id="haveDidShared"
					onChange={(e) => setHaveDidShared(e.target.checked)}
				/>
				<Label className="flex" htmlFor="haveDidShared">
					<p>Already have DID?</p>
				</Label>
			</div>
			{!haveDidShared ? (
				<>
					<div className="my-3">
						<div className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
							<Label value="Seed" />
						</div>
						<div className="flex">
							<CopyDid
								className="align-center block text-sm text-gray-900 dark:text-white"
								value={seedVal}
							/>
						</div>
					</div>

					<Formik
						initialValues={{
							seed: seedVal,
							method: '',
							network: '',
							did: '',
							ledger: '',
							label: orgName || '',
						}}
						validationSchema={yup.object().shape(validations)}
						onSubmit={(values: ValuesShared) => {
							submitSharedWallet(
								values,
								privateKeyValue,
								domainValue,
								endPointValue,
							);
						}}
					>
						{(formikHandlers) => (
							<Form className="">								

								<SelectField
                                    id='method'
									label="Method"
									name="method"
									value={formikHandlers.values.method}
									onChange={(e) => selectDidMethod(e, formikHandlers)}
									options={mappedData && Object.keys(mappedData)}
									error={formikHandlers.errors.method}
									touched={formikHandlers.touched.method}
								/>

								{formikHandlers.values.method === DidMethod.POLYGON && (
									<GenerateBtnPolygon
										generatePolygonKeyValuePair={() =>
											generatePolygonKeyValuePair()
										}
									/>
								)}

								{generatedKeys && (
									<div className="my-3 relative">
										<p className="text-sm truncate">
											<span className="font-semibold text-gray-900 dark:text-white">
												Private Key:
											</span>
											<div className="flex ">
												<CopyDid
													className="align-center block text-sm text-gray-900 dark:text-white truncate"
													value={generatedKeys?.privateKey}
												/>
											</div>
										</p>

										<p className="text-sm truncate">
											<span className="font-semibold text-gray-900 dark:text-white">
												Address:
											</span>
											<div className="flex ">
												<CopyDid
													className="align-center block text-sm text-gray-900 dark:text-white truncate"
													value={generatedKeys?.address}
												/>
											</div>
										</p>
									</div>
								)}

								{generatedKeys &&
									formikHandlers.values.method === DidMethod.POLYGON && (
										<TokenWarningMessage />
									)}

								{formikHandlers.values.method === DidMethod.POLYGON && (
									<SetPrivateKeyValue
										setPrivateKeyValue={(val: string) =>
											setPrivateKeyValue(val)
										}
										privateKeyValue={privateKeyValue}
									/>
								)}

								{formikHandlers.values.method === DidMethod.WEB && (
									<SetDomainValueInput
										setDomainValue={(val: string) => setDomainValue(val)}
										domainValue={domainValue}
									/>
								)}

								{formikHandlers.values.method !== DidMethod.POLYGON &&
									formikHandlers.values.method !== DidMethod.KEY &&
									formikHandlers.values.method !== DidMethod.WEB && (										

										<SelectField
                                            id='ledger'
											label="Ledger"
											name="ledger"
											value={selectedNetwork}
											onChange={(e) => selectDidLedger(e, formikHandlers)}
											options={
												mappedData &&
												selectedLedger &&
												mappedData[selectedLedger] &&
												Object.keys(mappedData[selectedLedger])
											}
											error={formikHandlers.errors.method}
											touched={formikHandlers.touched.method}
										/>
									)}
								{formikHandlers.values.method !== DidMethod.WEB &&
									formikHandlers.values.method !== DidMethod.KEY && (
										<LedgerLessMethodsComponents
											formikHandlers={formikHandlers}
											setSelectedDid={(val: string) => setSelectedDid(val)}
											selectedDid={selectedDid}
											mappedData={mappedData}
											selectedLedger={selectedLedger}
											selectedNetwork={selectedNetwork}
										/>
									)}

								<div className="my-3 relative">
									<label
										htmlFor="DID Method"
										className="text-sm font-medium text-gray-900 dark:text-gray-300"
									>
										DID Method
									</label>
									<div className="bg-gray-100 font-semibold text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11">
										{showMethod(formikHandlers.values.method)}
									</div>
								</div>
								<div className="mt-3 relative">
									<Label htmlFor="name" value="Wallet Label" />
									<span className="text-red-500 text-xs">*</span>

									<Field
										id="label"
										name="label"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										type="text"
									/>
									{formikHandlers?.errors?.label &&
										formikHandlers?.touched?.label && (
											<span className="text-red-500 absolute text-xs">
												{formikHandlers?.errors?.label}
											</span>
										)}
								</div>
								<div className="w-full flex justify-end">
									<Button
										type="submit"
										className="flex h-min p-0.5 focus:z-10 focus:outline-none border border-transparent enabled:hover:bg-cyan-800 dark:enabled:hover:bg-cyan-700 mt-4 text-base font-medium text-center text-white bg-primary-700 rounded-md hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
									>
										Submit
									</Button>
								</div>
							</Form>
						)}
					</Formik>
				</>
			) : (
				<Formik
					initialValues={{
						seed: '',
						method: '',
						network: '',
						did: '',
						ledger: '',
						label: orgName || '',
					}}
					validationSchema={yup.object().shape({
						seed: yup.string().required('Seed is required'),
						network: yup.string().required('Network is required'),
						label: yup.string().required('Wallet label is required'),
					})}
					onSubmit={(values: ValuesShared) => {
						submitSharedWallet(
							values,
							privateKeyValue,
							domainValue,
							endPointValue,
						);
					}}
				>
					{(formikHandlers) => (
						<Form className="">
							<div className="mt-3 relative">
								<div className="block">
									<Label htmlFor="seed" value="Seed" />
									<span className="text-red-500 text-xs">*</span>
								</div>

								<Field
									id="seed"
									name="seed"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									type="text"
								/>
								{formikHandlers?.errors?.seed &&
									formikHandlers?.touched?.seed && (
										<span className="text-red-500 absolute text-xs">
											{formikHandlers?.errors?.seed}
										</span>
									)}
							</div>

							<div className="mt-3 relative">
								<div className="block">
									<Label htmlFor="did" value="DID" />
									<span className="text-red-500 text-xs">*</span>
								</div>

								<Field
									id="did"
									name="did"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									type="text"
								/>
								{formikHandlers?.errors?.did &&
									formikHandlers?.touched?.did && (
										<span className="text-red-500 absolute text-xs">
											{formikHandlers?.errors?.did}
										</span>
									)}
							</div>							

							<SelectField
                                id='did_method'
								label="Method"
								name="method"
								value={formikHandlers.values.method}
                                onChange={(e) => selectDidMethod(e, formikHandlers)}							
								options={mappedData && Object.keys(mappedData)}
								error={formikHandlers.errors.method}
								touched={formikHandlers.touched.method}
							/>

							{formikHandlers.values.method === DidMethod.POLYGON && (
								<GenerateBtnPolygon
									generatePolygonKeyValuePair={() =>
										generatePolygonKeyValuePair()
									}
								/>
							)}

							{generatedKeys && (
								<div className="my-3 relative">
									<p className="text-sm truncate">
										<span className="font-semibold text-gray-900 dark:text-white">
											Private Key:
										</span>
										<div className="flex ">
											<CopyDid
												className="align-center block text-sm text-gray-900 dark:text-white truncate"
												value={generatedKeys?.privateKey}
											/>
										</div>
									</p>

									<p className="text-sm truncate">
										<span className="font-semibold text-gray-900 dark:text-white">
											Public Key Base58:
										</span>
										<div className="flex ">
											<CopyDid
												className="align-center block text-sm text-gray-900 dark:text-white truncate"
												value={generatedKeys?.publicKeyBase58}
											/>
										</div>
									</p>
									<p className="text-sm truncate">
										<span className="font-semibold text-gray-900 dark:text-white">
											Address:
										</span>
										<div className="flex ">
											<CopyDid
												className="align-center block text-sm text-gray-900 dark:text-white truncate"
												value={generatedKeys?.address}
											/>
										</div>
									</p>
								</div>
							)}

							{generatedKeys &&
								formikHandlers.values.method === DidMethod.POLYGON && (
									<TokenWarningMessage />
								)}

							{formikHandlers.values.method === DidMethod.POLYGON && (
								<SetPrivateKeyValue
									setPrivateKeyValue={(val: string) => setPrivateKeyValue(val)}
									privateKeyValue={privateKeyValue}
								/>
							)}

							{formikHandlers.values.method === DidMethod.WEB && (
								<SetDomainValueInput
									setDomainValue={(val: string) => setDomainValue(val)}
									domainValue={domainValue}
								/>
							)}

							{formikHandlers.values.method !== DidMethod.POLYGON &&
								formikHandlers.values.method !== DidMethod.KEY &&
								formikHandlers.values.method !== DidMethod.WEB && (								

									<SelectField
                                        id='did_ledger'
										label="Ledger"
										name="ledger"
										value={selectedNetwork}
                                        onChange={(e) => selectDidLedger(e, formikHandlers)}
										options={
											mappedData &&
											selectedLedger &&
											mappedData[selectedLedger] &&
											Object.keys(mappedData[selectedLedger])
										}
										error={formikHandlers.errors.method}
										touched={formikHandlers.touched.method}
									/>
								)}
							{formikHandlers.values.method !== DidMethod.WEB &&
								formikHandlers.values.method !== DidMethod.KEY && (
									<LedgerLessMethodsComponents
										formikHandlers={formikHandlers}
										setSelectedDid={(val: string) => setSelectedDid(val)}
										selectedDid={selectedDid}
										mappedData={mappedData}
										selectedLedger={selectedLedger}
										selectedNetwork={selectedNetwork}
									/>
								)}

							<div className="my-3 relative">
								<label
									htmlFor="DID Method"
									className="text-sm font-medium text-gray-900 dark:text-gray-300"
								>
									DID Method
								</label>
								<div className="bg-gray-100 font-semibold text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11">
									{showMethod(formikHandlers.values.method)}
								</div>
							</div>
							<div className="mt-3 relative">
								<Label htmlFor="name" value="Wallet Label" />
								<span className="text-red-500 text-xs">*</span>

								<Field
									id="label"
									name="label"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									type="text"
								/>
								{formikHandlers?.errors?.label &&
									formikHandlers?.touched?.label && (
										<span className="text-red-500 absolute text-xs">
											{formikHandlers?.errors?.label}
										</span>
									)}
							</div>
							<div className="w-full flex justify-end">
								<Button
									type="submit"
									className="flex h-min p-0.5 focus:z-10 focus:outline-none border border-transparent enabled:hover:bg-cyan-800 dark:enabled:hover:bg-cyan-700 mt-4 text-base font-medium text-center text-white bg-primary-700 rounded-md hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
								>
									Submit
								</Button>
							</div>
						</Form>
					)}
				</Formik>
			)}
		</div>
	);
};

export default SharedAgentForm;