import * as yup from 'yup';
import { Button, Label } from 'flowbite-react';
import { Field, Form, Formik, FormikProps } from 'formik';
import type React from 'react';
import { DidMethod } from '../../common/enums';
import CopyDid from '../../commonComponents/CopyDid';
import GenerateBtnPolygon from './walletCommonComponents/GenerateBtnPolygon';
import SetPrivateKeyValue from './walletCommonComponents/SetPrivateKeyValue';
import SetDomainValueInput from './walletCommonComponents/SetDomainValueInput';
import TokenWarningMessage from './walletCommonComponents/TokenWarningMessage';
import LedgerLessMethodsComponents from './walletCommonComponents/LegderLessMethods'
import SelectField from './SelectField';



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

interface IPolygonKeys {
	privateKey: string;
	publicKeyBase58: string;
	address: string;
}

interface DidSharedFormProps {
    orgName: string,
    submitSharedWallet: (values: ValuesShared, privateKeyValue: string, domainValue: string, endPointValue: string) => void;
    selectDidMethod: (e: React.ChangeEvent<HTMLSelectElement>, formikHandlers: FormikProps<any>) => void;
    generatePolygonKeyValuePair: () => void;
    generatedKeys?: IPolygonKeys | null;
    privateKeyValue: string;
    setPrivateKeyValue: (val: string) => void;
    domainValue: string;
    setDomainValue: (val: string) => void;
    mappedData: any; // You can refine the type as per your schema
    selectDidLedger: (e: React.ChangeEvent<HTMLSelectElement>, formikHandlers: FormikProps<any>) => void;
    selectedLedger: string;
    selectedNetwork: string;
    selectedDid: string,
    setSelectedDid: (val: string) => void;
    showMethod: (method: string) => JSX.Element | string;
  }


const AlreadyDidSharedForm: React.FC<DidSharedFormProps> = ({
    orgName,
    submitSharedWallet,
    selectDidMethod,
    generatePolygonKeyValuePair,
    generatedKeys,
    privateKeyValue,
    setPrivateKeyValue,
    domainValue,
    setDomainValue,
    mappedData,
    selectDidLedger,
    selectedLedger,
    selectedNetwork,
    selectedDid,
    setSelectedDid,
    showMethod,
}) => {
    return (
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
							''
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

							<SelectField id='did_method' label="Method"	name="method" value={formikHandlers.values.method} onChange={(e) => selectDidMethod(e, formikHandlers)}							
								options={mappedData && Object.keys(mappedData)} error={formikHandlers.errors.method}	touched={formikHandlers.touched.method}
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

									<SelectField id='did_ledger' label="Ledger"	name="ledger" value={selectedNetwork} onChange={(e) => selectDidLedger(e, formikHandlers)}
										options={
											mappedData && selectedLedger &&	mappedData[selectedLedger] && Object.keys(mappedData[selectedLedger])
										} error={formikHandlers.errors.method} touched={formikHandlers.touched.method}
									/>
								)}
							{formikHandlers.values.method !== DidMethod.WEB && formikHandlers.values.method !== DidMethod.KEY && (
									<LedgerLessMethodsComponents formikHandlers={formikHandlers} setSelectedDid={(val: string) => setSelectedDid(val)}
										selectedDid={selectedDid} mappedData={mappedData} selectedLedger={selectedLedger} selectedNetwork={selectedNetwork}
									/>
								)}

							<div className="my-3 relative">
								<label htmlFor="DID Method" className="text-sm font-medium text-gray-900 dark:text-gray-300">DID Method</label>
								<div className="bg-gray-100 font-semibold text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11">
									{showMethod(formikHandlers.values.method)}</div>
							</div>
							<div className="mt-3 relative">
								<Label htmlFor="name" value="Wallet Label" />
								<span className="text-red-500 text-xs">*</span>

								<Field
									id="label" name="label"	className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									type="text"
								/>
								{formikHandlers?.errors?.label && formikHandlers?.touched?.label && (
										<span className="text-red-500 absolute text-xs"> {formikHandlers?.errors?.label}</span>
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
    );
}

export default AlreadyDidSharedForm;