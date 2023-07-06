'use client';

import { Field, Form, Formik, FormikHelpers } from 'formik';
import { Button, Checkbox, Label, TextInput } from 'flowbite-react';
import * as yup from "yup"

import { asset, url } from '../lib/data.js';
import { passwordRegex } from '../config/CommonConstant.js';

interface Values {
    firstName: string;
    lastName: string;
    email: string;
}


const SignUpFormik = () => {

   return (
       <div
           className="w-full flex flex-col items-center justify-center px-6 pt-8 mx-auto pt:mt-0 dark:bg-gray-900"
       >
           <a
               href="#"
               className="flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white"
           >
               <img src={asset('images/logo.svg')} alt="FlowBite Logo" className="mr-4 h-11" />
               <span>CREDEBL</span>
           </a>
           <div
               className="w-full max-w-xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800"
           >
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                   Create a Free Account
               </h2>

        <Formik
            initialValues={{
                firstName: '',
                lastName: '',
                email: '',
            }}
                   validationSchema={yup.object().shape({
                       firstName: yup
                           .string()
                           .min(2, 'First name must be at least 2 characters')
                           .max(255, 'First name must be at most 255 characters')
                           .required('First name is required')
                           .trim(),
                       lastName: yup
                           .string()
                           .min(2, 'Last name must be at least 2 characters')
                           .max(255, 'Last name must be at most 255 characters')
                           .required('Last name is required')
                           .trim(),
                       email: yup
                           .string()
                           .required('Email is required')
                           .email("Email is invalid")
                           .trim(),
                       password: yup
                           .string()
                           .required('Password is required')
                           .matches(passwordRegex, "customPasswordMsg"),
                       confirmPassword: yup
                           .string()
                           .required('Confirm Password is required')
                           .oneOf([yup.ref('password')], 'Passwords must match')
                   })}
                   validateOnBlur
                   validateOnChange
                   enableReinitialize
            onSubmit={(
                values: Values,
                { setSubmitting }: FormikHelpers<Values>
            ) => {
                setTimeout(() => {
                    alert(JSON.stringify(values, null, 2));
                    setSubmitting(false);
                }, 500);
            }}
        >
                   <Form className="mt-8 space-y-6">
                       <div>
                           <div
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                           >
                               <Label
                                   htmlFor="firstName"
                                   value="Firstname"
                               />
                           </div>
                           <Field 
                           id="firstName" 
                           name="firstName" 
                           required
                           className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                           placeholder="John" />

                       </div>
                       <div>
                           <div
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                           >
                               <Label
                                   htmlFor="lastName"
                                   value="Lastname"
                               />
                           </div>
                           <Field
                               id="lastName"
                               name="lastName"
                               required
                               className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                               placeholder="Doe" />

                       </div>
                       <div>
                           <div
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                           >
                               <Label
                                   htmlFor="email2"
                                   value="email"
                               />
                           </div>
                           <Field
                               id="email"
                               name="email"
                               required
                               placeholder="john@acme.com"
                               className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                               type="email"
                           />

                       </div>
                       <div>
                           <div className="mb-2 block">
                               <Label
                                   htmlFor="password"
                                   value="Your password"
                               />
                           </div>
                          
                           <Field
                               id="password"
                               name="password"
                               required                               
                               className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                               type="password"
                           />

                       </div>
                       <div>
                           <div className="mb-2 block">
                               <Label
                                   htmlFor="confirmPassword"
                                   value="Confirm password"
                               />
                           </div>
                           <Field
                               id="confirmPassword"
                               name="confirmPassword"
                               required                               
                               className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                               type="password"
                           />
                       </div>
                       <div className="flex items-center gap-2">
                           <Checkbox id="agree" />
                           <Label
                               className="flex"
                               htmlFor="agree"
                           >
                               <p>
                                   I agree with the
                               </p>

                           </Label>
                       </div>
                       <Button type="submit"
                           className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                       >
                           Register new account
                       </Button>
            </Form>
        </Formik>

           </div>
       </div>

)};

export default SignUpFormik;