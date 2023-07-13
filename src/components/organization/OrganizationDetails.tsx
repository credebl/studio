import * as yup from 'yup';

import { Button, Checkbox, Label, TextInput } from 'flowbite-react';
import {
    Field,
    Form,
    Formik,
    FormikHelpers,
    FormikProps,
    FormikValues,
} from 'formik';

interface Values {
	seed: string;
    name:string,
    password: string
}


const OrganizationDetails = () => {

    return (
        <div
            className="mt-4 flex-col p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
        >

            <div
                className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4"
            >

                <div>
                    <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                        Organization Wallet Details
                    </h3>

                </div>

            </div>
          
        </div>
    )

}

export default OrganizationDetails