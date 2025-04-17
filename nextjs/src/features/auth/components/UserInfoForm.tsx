'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, KeyRound, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { passwordEncryption, addPasswordDetails, getUserProfile } from '@/app/api/Auth';
import { apiStatusCodes, passwordRegex } from '@/config/CommonConstant';
import { AxiosError, AxiosResponse } from 'axios';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/lib/hooks';
import { addDeviceDetails, generateRegistrationOption, getUserDeviceDetails, verifyAuthentication, verifyRegistration } from '@/app/api/Fido';
import { setProfile } from '@/lib/profileSlice';
import { setOrgId } from '@/lib/orgSlice';

import { startRegistration } from '@simplewebauthn/browser';
import { IdeviceBody, IDeviceData, VerifyRegistrationObjInterface } from '@/components/profile/interfaces';

interface StepUserInfoProps {
  email: string;
  goBack: () => void;
}

export interface RegistrationOptionInterface {
  userName: string,
  deviceFlag: boolean

}

enum PlatformRoles {
  platformAdmin = 'platform_admin'
}

export enum Devices {
  Linux = 'linux'
  }

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'Please enter at least two characters')
    .max(50, 'Name cannot exceed 50 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Please enter at least two characters')
    .max(50, 'Name cannot exceed 50 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      passwordRegex,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required')
});

export default function UserInfoForm({ email }: StepUserInfoProps) {
  const [loading, setLoading] = useState(false);

  const [serverError, setServerError] = useState('');
  const [isDevice, setIsDevice] = useState<boolean>(false);
  const [showEmailVerification, setShowEmailVerification] = useState({
    message: '',
    isError: false,
    type: ''
  });
  const [editFailure, setEditFailure] = useState<string | null>(null);

  const [deviceList, setDeviceList] = useState<IDeviceData[]>([]);

  const [usePassword, setUsePassword] = useState(true);
	const [disableFlag, setDisableFlag] = useState<boolean>(false);
	const [addfailure, setAddFailure] = useState<string | null>(null);

  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [erroMsg, setErrMsg] = useState<string | null>(null)

  const router = useRouter();
  const [fidoLoader, setFidoLoader] = useState<boolean>(false);
  const [fidoUserError, setFidoUserError] = useState('');
  const [fidoError, setFidoError] = useState('');

const dispatch = useAppDispatch();
  const onSubmit = async (values: {
    firstName: string;
    lastName: string;
    password: string;
  }) => {
    setServerError('');
    setShowEmailVerification({ message: '', isError: false, type: '' });

    const payload = {
      email: email,
      password: passwordEncryption(values.password),
      isPasskey: false,
      firstName: values.firstName,
      lastName: values.lastName
    };

    try {
      setLoading(true);
      const userRsp = await addPasswordDetails(payload);
      const { data } = userRsp as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        router.push(
          `/auth/sign-in?signup=true&email=${email}&fidoFlag=false&method=password`
        );
      } else {
        setShowEmailVerification({
          message: data?.message || 'Failed to create account.',
          isError: true,
          type: 'danger'
        });
      }
    } catch (err) {
      setShowEmailVerification({
        message: 'An unexpected error occurred.',
        isError: true,
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };
  const verifyAuthenticationMethod = async (
    verifyAuthenticationObj: any,
    userData: { userName: string }
  ): Promise<string | AxiosResponse> => {
    try {
      const res = verifyAuthentication(verifyAuthenticationObj, userData);
      return await res;
    } catch (error) {
      setFidoLoader(false);
      throw error;
    }
  };

  const addDevice = async (): Promise<void> => {
    console.log('addDevice');
		try {
			if(deviceList?.length > 0){
				registerWithPasskey(true)
			}
		} catch (error) {
			setFidoLoader(false);
		}
	};

  const getUserDetails = async (access_token: string) => {
    try {
      const response = await getUserProfile(access_token);

      const { data } = response as AxiosResponse;

      if (data?.data?.userOrgRoles?.length > 0) {
        const role = data?.data?.userOrgRoles.find(
          (item: { orgRole: { name: PlatformRoles } }) =>
            item.orgRole.name === PlatformRoles.platformAdmin
        );

        const permissionArray: string[] = [];
        data?.data?.userOrgRoles?.forEach(
          (element: { orgRole: { name: string } }) =>
            permissionArray.push(element?.orgRole?.name)
        );

        const { id, profileImg, firstName, lastName, email } = data?.data || {};
        const userProfile = {
          id,
          profileImg,
          firstName,
          lastName,
          email
        };
        dispatch(setProfile(userProfile));

        const orgWithValidId = data?.data?.userOrgRoles.find(
          (item: { orgId: string | null }) => item.orgId !== null
        );
        const orgId = orgWithValidId?.orgId ?? null;

        dispatch(setOrgId(orgId));
        return {
          role: role?.orgRole ?? '',
          orgId
        };
      } else {
        console.error('No roles found for the user');
      }
    } catch (error) {
      console.error('Error fetching user details', error);
    }
  };

  const showFidoError = (error: unknown): void => {
    const err = error as AxiosError;
    if (
        err.message.includes('The operation either timed out or was not allowed')
    ) {
        const [errorMsg] = err.message.split('.');
        setFidoError(errorMsg);
    } else {
        setFidoError(err.message);
    }
};


  const registerWithPasskey = async (flag: boolean): Promise<void> => {
    try {
      
      // const userEmail = await getFromLocalStorage(storageKeys.USER_EMAIL)
      const RegistrationOption: RegistrationOptionInterface = {
        userName: email,
        deviceFlag: flag
      }
      const generateRegistrationResponse = await generateRegistrationOption(RegistrationOption)
      console.log("inside register with paskey function");
        const { data } = generateRegistrationResponse as AxiosResponse
        console.log("🚀 ~ registerWithPasskey ~ data5555555555:", data)
        if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
            const opts = data?.data
            const challangeId = opts?.challenge
            console.log("🚀 ~ registerWithPasskey ~ challangeId:", challangeId)

            if (opts) {
                opts.authenticatorSelection = {
                    residentKey: "preferred",
                    requireResidentKey: false,
                    userVerification: "preferred"
                }
                console.log("🚀 ~ registerWithPasskey ~   opts.authenticatorSelection:",   opts.authenticatorSelection)
            }
            setLoading(false)
            console.log("🚀 ~ registerWithPasskey ~ opts:", opts)
            
            const attResp = await startRegistration(opts)
            console.log("🚀 ~ registerWithPasskey ~ attResp:", attResp)
            const verifyRegistrationObj: VerifyRegistrationObjInterface = {
                ...attResp,
                challangeId
            }
            console.log("🚀 ~ registerWithPasskey ~ verifyRegistrationObj:", verifyRegistrationObj)

            await verifyRegistrationMethod(verifyRegistrationObj, email);
        } else {
            setErrMsg(generateRegistrationResponse as string)
        }
    } catch (error) {
        showFidoError(error)
    }
}

  // const registerWithPasskey = async (flag: boolean): Promise<void> => {
	// 	try {
	// 		const RegistrationOption: RegistrationOptionInterface = {
	// 			userName: email,
	// 			deviceFlag: flag,
	// 		};
	// 		// Generate Registration Option
	// 		const generateRegistrationResponse = await generateRegistrationOption(
	// 			RegistrationOption,
	// 		);
	// 		const { data } = generateRegistrationResponse as AxiosResponse;
	// 		const opts = data?.data;
	// 		const challangeId = data?.data?.challenge;
	// 		if (opts) {
	// 			opts.authenticatorSelection = {
	// 				residentKey: 'preferred',
	// 				requireResidentKey: false,
	// 				userVerification: 'preferred',
	// 			};
	// 		}
	// 		const attResp = await startRegistration(opts);

	// 		const verifyRegistrationObj = {
	// 			...attResp,
	// 			challangeId,
	// 		};
	// 		await verifyRegistrationMethod(verifyRegistrationObj, email);
	// 	} catch (error) {
	// 	}
	// };

  let credentialID = '';
    const verifyRegistrationMethod = async (verifyRegistrationObj: VerifyRegistrationObjInterface, OrgUserEmail: string) => {
        try {
            const verificationRegisterResp = await verifyRegistration(verifyRegistrationObj, OrgUserEmail)
            const { data } = verificationRegisterResp as AxiosResponse
            credentialID = encodeURIComponent(data?.data?.newDevice?.credentialID)
            if (data?.data?.verified) {
                let platformDeviceName = ''

                if (verifyRegistrationObj?.authenticatorAttachment === "cross-platform") {
                    platformDeviceName = 'Passkey'
                } else {
                    platformDeviceName = navigator.platform
                }

                const deviceBody: IdeviceBody = {
                    userName: OrgUserEmail,
                    credentialId: credentialID,
                    deviceFriendlyName: platformDeviceName
                }
                await addDeviceDetailsMethod(deviceBody)
            }
        } catch (error) {
            showFidoError(error)
        }
    }


    const addDeviceDetailsMethod = async (deviceBody: IdeviceBody) => {
      console.log("add API called");
      
      try {
          const deviceDetailsResp = await addDeviceDetails(deviceBody)
          const { data } = deviceDetailsResp as AxiosResponse
          if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      console.log("a2200000000000");

          router.push('/auth/sign-in')         
          } 
          setTimeout(() => {
              setAddSuccess('')
              setAddFailure('')
          });
      } catch (error) {
          showFidoError(error)
      }
  }
	//userDeviceDetails on page reload
	const userDeviceDetails = async (): Promise<void> => {
		try {
			setFidoLoader(true);

			const userDeviceDetailsResp = await getUserDeviceDetails(email);
			const { data } = userDeviceDetailsResp as AxiosResponse;
			setFidoLoader(false);
			if (userDeviceDetailsResp) {
				const deviceDetails =
					Object.keys(data)?.length > 0
						? userDeviceDetailsResp?.data?.data.map((data: { lastChangedDateTime: any; }) => {
								data.lastChangedDateTime = data.lastChangedDateTime
									? data.lastChangedDateTime
									: '-';
								return data;
						  })
						: [];
				if (data?.data?.length === 1) {
					setDisableFlag(true);
				} else {
					setDisableFlag(false);
				}
				setDeviceList(deviceDetails);
			}
		} catch (error) {
			setAddFailure('Error while fetching the device details');
			setFidoLoader(false);
		}
	};
	useEffect(() => {
		// if (email) {
			userDeviceDetails();
		// } else {
		// 	setProfile();
		// }
		const platform = navigator.platform.toLowerCase();
        if (platform.includes(Devices.Linux)) {
            setIsDevice(true);
        }
	}, [email]);

  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, handleChange, handleBlur, values }) => (
        <FormikForm className='space-y-4'>
          {showEmailVerification.message && (
            <div
              className={`mb-4 rounded-md p-3 text-sm ${
                showEmailVerification.type === 'danger'
                  ? 'bg-[var(--color-text-error)] text-white'
                  : 'bg-[var(--color-bg-success)] text-white'
              }`}
            >
              {showEmailVerification.message}
            </div>
          )}

          <div className='flex gap-3'>
            <div className='flex-1'>
              <Input
                placeholder='First name'
                name='firstName'
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className='bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]'
              />
              {errors.firstName && touched.firstName && (
                <p className='text-destructive mt-1 text-sm'>
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className='flex-1'>
              <Input
                placeholder='Last name'
                name='lastName'
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className='bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]'
              />
              {errors.lastName && touched.lastName && (
                <p className='text-destructive mt-1 text-sm'>
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className='relative'>
            <Input
              placeholder='Email address'
              value={email}
              readOnly
              className='bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]'
            />
            <CheckCircle className='absolute top-3 right-3 h-5 w-5 text-[var(--color-bg-success)]' />
          </div>

          <div className='flex overflow-hidden rounded-md border border-[var(--color-border)]'>
            <Button
              type='button'
              className={`flex-1 rounded-none ${
                usePassword
                  ? 'bg-[var(--color-bg-button-selected)] text-[var(--color-text-button-selected)]'
                  : 'bg-[var(--color-bg-button-unselected)] text-[var(--color-text-button-unselected)]'
              }`}
              onClick={() => setUsePassword(true)}
            >
              <Lock className='mr-2 h-4 w-4' />
              Password
            </Button>

              <Button
                type='button'
                className={`flex-1 rounded-none ${
                  !usePassword
                    ? 'bg-[var(--color-bg-button-selected)] text-[var(--color-text-button-selected)]'
                    : 'bg-[var(--color-bg-button-unselected)] text-[var(--color-text-button-unselected)]'
                }`}
                onClick={() => {
                  registerWithPasskey(true)   
              }}
              >
                <KeyRound className='mr-2 h-4 w-4' />
                Passkey
              </Button>
          </div>

          {usePassword ? (
            <>
              <div>
                <Input
                  type='password'
                  placeholder='Create password'
                  name='password'
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.password && touched.password && (
                  <p className='text-destructive mt-1 text-sm'>
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type='password'
                  placeholder='Confirm password'
                  name='confirmPassword'
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className='text-destructive mt-1 text-sm'>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className='text-muted-foreground text-center'>
            </div>
          )}

          {serverError && (
            <div className='text-destructive text-center'>{serverError}</div>
          )}

          <div className='flex justify-center gap-2'>
            <Button type='submit' disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </FormikForm>
      )}
    </Formik>
  );
}
