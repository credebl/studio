import { Button } from "flowbite-react";
import React from "react";

const RegistrationSuccess = () => {

    const redirectSignInPage = () => {
        window.location.href = '/authentication/sign-in'
    }

    return (
        <div className='h-50'>


            <div className="w-full h-full bg-white flex-shrink-0">
                <div className="flex flex-col md:flex-row" style={{ height: '830px' }}>
                    <div className="flex md:h-auto md:w-3/5 bg-white" style={{ justifyContent: 'center', padding: 100 }}>
                        <div className='absolute left-10 top-10'>
                            <a href="/" className="flex items-center">
                                <img
                                    src="/images/CREDEBL_ICON.png"
                                    className="mr-2 h-6 sm:h-9"
                                    alt="CREDEBL Logo"
                                />
                                <span
                                    className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"
                                >
                                    CREDEBL</span>

                            </a>
                        </div>

                        <img className="flex"
                            src="/images/signin.svg"
                            alt="img" />
                        <div className="absolute left-10 bottom-10">
                            &copy; 2019 - {new Date().getFullYear()} —
                            <a className="hover:underline" target="_blank"
                            >CREDEBL</a> | All rights reserved.
                        </div>

                    </div>
                    <div className="flex items-center justify-center p-6 sm:p-12 md:w-2/5 shadow-xl shadow-blue-700">
                        <div className="w-full" style={{ height: '700px' }}>

                            <div className="mt-20 mb-24 flex justify-center mb-4 text-center text-primary-700 text-blue-600 font-inter text-4xl font-bold leading-10 ">
                                Congratulations!
                            </div>

                            <div className="mt-20 flex justify-center text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="99" height="99" viewBox="0 0 99 99" fill="none">
                                    <path d="M49.0889 0C42.6424 -9.6864e-08 36.2591 1.28035 30.3034 3.76796C24.3476 6.25557 18.9361 9.90171 14.3778 14.4982C9.81948 19.0947 6.20361 24.5516 3.73667 30.5572C1.26972 36.5628 0 42.9996 0 49.5C0 56.0004 1.26972 62.4372 3.73667 68.4428C6.20361 74.4484 9.81948 79.9053 14.3778 84.5018C18.9361 89.0983 24.3476 92.7444 30.3034 95.232C36.2591 97.7197 42.6424 99 49.0889 99C55.5353 99 61.9186 97.7197 67.8744 95.232C73.8301 92.7444 79.2416 89.0983 83.7999 84.5018C88.3583 79.9053 91.9741 74.4484 94.4411 68.4428C96.908 62.4372 98.1777 56.0004 98.1777 49.5C98.1777 42.9996 96.908 36.5628 94.4411 30.5572C91.9741 24.5516 88.3583 19.0947 83.7999 14.4982C79.2416 9.90171 73.8301 6.25557 67.8744 3.76796C61.9186 1.28035 55.5353 -9.6864e-08 49.0889 0Z" fill="#14BD5A" />
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M80.4367 34.3527C81.1905 35.2635 81.0662 36.6202 80.1593 37.3831L41.4011 69.9827C40.9543 70.3585 40.3754 70.5353 39.798 70.4722C39.2206 70.4091 38.6946 70.1116 38.3412 69.6483L21.7122 47.8438C20.9951 46.9034 21.1726 45.5525 22.1088 44.8264C23.045 44.1003 24.3853 44.274 25.1025 45.2143L40.3804 65.2472L77.4297 34.0849C78.3367 33.322 79.683 33.4419 80.4367 34.3527Z" fill="white" />
                                </svg>


                            </div>
                            <p className="text-gray-500 font-inter text-base font-medium leading-5 flex w-84 h-5.061 flex-col justify-center items-center flex-shrink-0">
                                Passkey created successfully
                            </p>


                            <div>
                                <Button
                                    type="submit"
                                    onClick={redirectSignInPage}

                                    className='w-[604px] mt-20 font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'

                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="21" viewBox="0 0 38 37" fill="none">
                                        <path d="M25.6203 21.2026C25.9292 21.2026 26.2293 21.053 26.389 20.7875C26.6242 20.3982 26.4697 19.9092 26.0451 19.6936C24.8394 19.0839 23.5513 18.6222 22.2245 18.2876C25.6888 16.7062 28.079 13.4342 28.079 9.65217C28.079 4.329 23.3565 0 17.5494 0C11.7423 0 7.01973 4.329 7.01973 9.65217C7.01973 13.4326 9.40823 16.7015 12.8672 18.2844C9.97157 19.0132 7.31283 20.4063 5.13493 22.4027C1.82335 25.4383 0 29.4793 0 33.7826V36.1956C0 36.6396 0.393134 37 0.877497 37C1.36186 37 1.75499 36.6396 1.75499 36.1956V33.7826C1.75499 29.9088 3.39762 26.2732 6.3775 23.5401C9.35739 20.8069 13.3253 19.3043 17.5494 19.3043C20.2257 19.3043 22.8705 19.9269 25.1975 21.1029C25.3308 21.1704 25.4765 21.2026 25.6203 21.2026ZM8.77472 9.65217C8.77472 5.217 12.711 1.60867 17.5494 1.60867C22.3877 1.60867 26.3241 5.217 26.3241 9.65217C26.3241 14.0873 22.3877 17.6957 17.5494 17.6957C12.711 17.6956 8.77472 14.0873 8.77472 9.65217Z" fill="white" />
                                        <path d="M21.2585 36.3855C19.9011 25.8284 27.5516 21.0023 36.3948 21.5679" stroke="white" stroke-linecap="round" />
                                        <path d="M33.6328 18.5L36.9964 21.5833L33.6328 24.6667" stroke="white" stroke-linecap="round" />
                                    </svg>
                                    <span className="ml-2">continue</span>

                                </Button>
                            </div>


                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default RegistrationSuccess;