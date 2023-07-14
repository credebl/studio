import * as yup from 'yup';

import { Button, Label } from 'flowbite-react';
import {
    Field,
    Form,
    Formik
} from 'formik';
import { useEffect, useState } from 'react';

import { nanoid } from 'nanoid'
import { passwordRegex } from '../../config/CommonConstant';

interface Values {
    seed: string;
    name: string,
    password: string
}

interface ValuesShared {
    seed: string;
    label: string,
}


enum AgentType {
    SHARED = 'shared',
    DEDICATED = 'dedicated'
}


const WalletSpinup = () => {

    const [agentType, setAgentType] = useState<string>(AgentType.SHARED);

    const [loading, setLoading] = useState<boolean>(true)

    const [seeds, setSeeds] = useState<string>('')

    useEffect(() => {
        setSeeds(nanoid())
    }, [])



    const onRadioSelect = (type: string) => {
        setAgentType(type)
    }

    const submitDedicatedWallet = async (values: Values) => {

    }

    const submitSharedWallet = (values: ValuesShared) => {

    }
 
 
    const DidicatedAgentForm = () => (
    <Formik
        initialValues={{
            seed: '',
            name: '',
            password: ''
        }}
        validationSchema={yup.object().shape({
            name: yup
                .string()
                .min(6, 'Wallet name must be at least 6 characters')
                .max(20, 'Wallet name must be at most 20 characters')
                .trim()
                .required('Wallet name is required')
                .matches(
                    /^[A-Za-z0-9-][^ !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]*$/,
                    "Wallet name must be alphanumeric only"
                )
                .label("Wallet name"),
            password: yup
                .string()
                .matches(passwordRegex, "Password must contain one Capital, Special character")
                .required('Wallet password is required')
                .label("Wallet password")
        })}
        validateOnBlur
        validateOnChange
        enableReinitialize
        onSubmit={(values: Values) => submitDedicatedWallet(values)
            // alert(JSON.stringify(values))
        }
    >
        {(formikHandlers): JSX.Element => (
            <Form className="mt-8 space-y-6 max-w-lg flex-col gap-4" onSubmit={formikHandlers.handleSubmit}>

                <div>
                    <div className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                        <Label htmlFor="seed" value="Seed" />
                        <span className='text-red-500 text-xs'>*</span>
                    </div>
                    <Field
                        id="seed"
                        name="seed"
                        disabled={true}
                        value={seeds}
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        type="text"
                    />
                    {
                        (formikHandlers?.errors?.seed && formikHandlers?.touched?.seed) &&
                        <span className="text-red-500 text-xs">{formikHandlers?.errors?.seed}</span>
                    }
                </div>
                <div>
                    <div className="mb-1 block">
                        <Label htmlFor="name" value="Wallet Name" />
                        <span className='text-red-500 text-xs'>*</span>
                    </div>

                    <Field
                        id="name"
                        name="name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        type="text"
                    />
                    {
                        (formikHandlers?.errors?.name && formikHandlers?.touched?.name) &&
                        <span className="text-red-500 text-xs">{formikHandlers?.errors?.name}</span>
                    }
                </div>

                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="password" value="Password" />
                        <span className='text-red-500 text-xs'>*</span>
                    </div>

                    <Field
                        id="password"
                        name="password"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        type="password"
                    />
                    {
                        (formikHandlers?.errors?.password && formikHandlers?.touched?.password) &&
                        <span className="text-red-500 text-xs">{formikHandlers?.errors?.password}</span>
                    }
                </div>
                <Button
                    // isProcessing={loading}
                    type="submit"
                    className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                >
                    Setup Agent
                </Button>
            </Form>
        )}
    </Formik>
)

const SharedAgentForm = () => (
    <Formik
        initialValues={{
            seed: '',
            label: '',
        }}
        validationSchema={yup.object().shape({
            seed: yup
                .string()
                .required('Seed is required')
                .trim(),
            label: yup
                .string()
                .required('Wallet label is required')
                .trim(),
        })}
        validateOnBlur
        validateOnChange
        enableReinitialize
        onSubmit={(values: ValuesShared) =>  submitSharedWallet(values)
            // alert(JSON.stringify(values))
        }
    >
        {(formikHandlers): JSX.Element => (
            <Form className="mt-8 space-y-6 max-w-lg flex-col gap-4" onSubmit={formikHandlers.handleSubmit}>


                <div>
                    <div className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                        <Label htmlFor="seed" value="Seed" />
                        <span className='text-red-500 text-xs'>*</span>
                    </div>
                    <Field
                        id="seed"
                        name="seed"
                        disabled={true}
                        value={seeds}
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        type="text"
                    />
                    {
                        (formikHandlers?.errors?.seed && formikHandlers?.touched?.seed) &&
                        <span className="text-red-500 text-xs">{formikHandlers?.errors?.seed}</span>
                    }
                </div>
                <div>
                    <div className="mb-1 block">
                        <Label htmlFor="name" value="Wallet Label" />
                        <span className='text-red-500 text-xs'>*</span>
                    </div>

                    <Field
                        id="label"
                        name="label"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        type="text"
                    />
                    {
                        (formikHandlers?.errors?.label && formikHandlers?.touched?.label) &&
                        <span className="text-red-500 text-xs">{formikHandlers?.errors?.label}</span>
                    }
                </div>

                <Button
                    // isProcessing={loading}
                    type="submit"
                    className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                >
                    Setup Agent
                </Button>
            </Form>
        )}
    </Formik>
)

   return (
        <div
            className="mt-4 flex-col p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
        >

            <div
                className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4"
            >

                <div>
                    <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                        Agent Spinup
                    </h3>

                </div>
            </div>

   <div  className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-2">

            <div>           
            <div className="mt-4 flex max-w-lg flex-col gap-4">
                <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                        <div className="flex items-center pl-3">
                            <input
                                id="horizontal-list-radio-license"
                                type="radio"
                                checked={agentType === AgentType.SHARED ? true : false}
                                value=""
                                onChange={() => onRadioSelect(AgentType.SHARED)}
                                name="list-radio"
                                className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                            <label className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Shared</label>
                        </div>
                    </li>
                    <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                        <div className="flex items-center pl-3">
                            <input
                                id="horizontal-list-radio-id"
                                type="radio"
                                value=""
                                onChange={() => onRadioSelect(AgentType.DEDICATED)}
                                checked={agentType === AgentType.DEDICATED ? true : false}
                                name="list-radio"
                                className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                            <label className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Dedicated </label>

                        </div>
                    </li>
                </ul>
            </div>

            {/* <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Identification</h3> */}


                {
                    agentType === AgentType.SHARED
                        ? <SharedAgentForm />
                        : <DidicatedAgentForm />
                }
             </div>        
                <WalletSteps />
            </div>


        </div>
    )


}

const WalletSteps = () => (
    <ol className="relative text-gray-500 border-l border-gray-200 dark:border-gray-700 dark:text-gray-400">
        <li className="mb-10 ml-6">
            <span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
                <svg className="w-3.5 h-3.5 text-green-500 dark:text-green-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
                </svg>
            </span>
            <h3 className="font-medium leading-tight">Personal Info</h3>
            <p className="text-sm">Step details here</p>
        </li>
        <li className="mb-10 ml-6">
            <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
                <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                    <path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z" />
                </svg>
            </span>
            <h3 className="font-medium leading-tight">Account Info</h3>
            <p className="text-sm">Step details here</p>
        </li>
        <li className="mb-10 ml-6">
            <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
                <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                    <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                </svg>
            </span>
            <h3 className="font-medium leading-tight">Review</h3>
            <p className="text-sm">Step details here</p>
        </li>
        <li className="ml-6">
            <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
                <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                    <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2ZM7 2h4v3H7V2Zm5.7 8.289-3.975 3.857a1 1 0 0 1-1.393 0L5.3 12.182a1.002 1.002 0 1 1 1.4-1.436l1.328 1.289 3.28-3.181a1 1 0 1 1 1.392 1.435Z" />
                </svg>
            </span>
            <h3 className="font-medium leading-tight">Confirmation</h3>
            <p className="text-sm">Step details here</p>
        </li>
    </ol>
)




export default WalletSpinup