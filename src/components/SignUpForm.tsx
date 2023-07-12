'use client';

import { Button, Checkbox, Label, TextInput } from 'flowbite-react';
import { asset, url } from '../lib/data.js';

export default function ShadowInputs() {

    const signUp = () => {
        alert('SIgn Up Data Send')
    }

    return (
        <div
            className="w-full flex flex-col items-center justify-center px-6 pt-8 mx-auto pt:mt-0 dark:bg-gray-900"
        >
            <a
                href="#"
                className="flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white"
            >
                <img src={asset('images/logo.svg')} alt="CREDEBL Logo" className="mr-4 h-11" />
                <span>CREDEBL</span>
            </a>
            <div
                className="w-full max-w-xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800"
            >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Create a Free Account
                </h2>

                <form className="mt-8 space-y-6" onSubmit={signUp}>
                    <div>
                        <div
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            <Label
                                htmlFor="email2"
                                value="Your email"
                            />
                        </div>
                        <TextInput
                            id="email2"
                            placeholder="name@credebl.id"
                            required
                            shadow
                            type="email"
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label
                                htmlFor="password2"
                                value="Your password"
                            />
                        </div>
                        <TextInput
                            id="password2"
                            required
                            shadow
                            type="password"
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label
                                htmlFor="repeat-password"
                                value="Repeat password"
                            />
                        </div>
                        <TextInput
                            id="repeat-password"
                            required
                            shadow
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
                </form>

    
                {/* <Button
                onClick={signUp}
                    className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                >
                    Register new account
                </Button> */}
        	</div>
</div>

    )
}


