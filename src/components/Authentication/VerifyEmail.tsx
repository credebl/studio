import { Button, Card, Spinner } from 'flowbite-react';
import { EmailVerifyData, verifyUserMail } from '../../api/Auth';
import { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import { HiOutlineMail } from "react-icons/hi";
import { apiStatusCodes } from '../../config/CommonConstant';

const VerifyEmail = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [message, setMessage] = useState<string>('')
    const [error, setError] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')

    const verifyEmailSuccess = async(payload: EmailVerifyData) => {
    
        const response = await verifyUserMail(payload);
        const { data } = response as AxiosResponse

        if(data?.statusCode ===  apiStatusCodes.API_STATUS_SUCCESS){
            setError(false)
            setMessage(data?.message)

        }else{
            setError(true)
          setMessage(response as string)
        }

        setLoading(false)

    }

     useEffect(() => {
        const queryParameters = new URLSearchParams( window?.location?.search)
        const payload: EmailVerifyData = {
             verificationCode: queryParameters.get("verificationCode") || '',
             email: queryParameters.get("email") || ''
        }
        setEmail(payload?.email)
        verifyEmailSuccess(payload)

    }, []);
    
    
  return (
    <div className="min-h-screen align-middle flex pb-[12vh]">
			<div className="w-full flex flex-col items-center justify-center px-6 pt-8 mx-auto pt:mt-0 dark:bg-gray-900">
                <Card className="max-w-lg flex flex-col items-center justify-center">
                    {
                        loading ?
                        <Spinner
                            color="info"
                        />
                        :
                        <div className='w-full flex flex-col items-center justify-center px-12'>
                        <HiOutlineMail size={40} color='gray'/>
                        <p className={`${error?`text-red-500`:`text-green-500`} mt-4 text-lg`}>{message}</p>
                        <a  href={`/authentication/sign-up?email=${email}`}>
                        <Button
                            color='bg-primary-800'   
                            className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-8'
                        >
                            Go to sign up
                        </Button>
                        </a>
                    </div>
                    }
                </Card>	
			</div>
		</div>

  )
}

export default VerifyEmail