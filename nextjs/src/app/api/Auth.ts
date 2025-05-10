import { axiosGet, axiosPost, axiosPut } from '@/services/apiRequests';

import CryptoJS from 'crypto-js';
import { apiRoutes } from '@/config/apiRoutes';
import { getHeaderConfigs } from '@/config/GetHeaderConfigs';

export interface IUserSignUpData {
  email: string;
  clientId: string;
  clientSecret: string;
}
export interface IAddPasswordDetails {
  email: string;
  password: string;
  isPasskey: boolean;
  firstName: string | null;
  lastName: string | null;
}
export interface IUserSignInData {
  email: string | undefined;
  isPasskey: boolean;
  password?: string;
}
export interface IEmailVerifyData {
  verificationCode: string;
  email: string;
}

export interface IKeyCloakData {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export const sendVerificationMail = async (payload: IUserSignUpData) => {
  const details = {
    url: apiRoutes.auth.sendMail,
    payload,
    config: { headers: { 'Content-type': 'application/json' } }
  };
  try {
    const response = await axiosPost(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const resetPassword = async (
  payload: { password: string; token: string | null },
  email: string | null
) => {
  const details = {
    url: `${apiRoutes.auth.resetPassword}/${email}`,
    payload
  };
  try {
    const response = await axiosPost(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const forgotPassword = async (payload: { email: string }) => {
  const details = {
    url: apiRoutes.auth.forgotPassword,
    payload
  };
  try {
    const response = await axiosPost(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const loginUser = async (payload: IUserSignInData) => {
  const details = {
    url: apiRoutes.auth.sinIn,
    payload,
    config: { headers: { 'Content-type': 'application/json' } }
  };
  try {
    const response = await axiosPost(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const resetPasswordKeyCloak = async (payload: IKeyCloakData) => {
  const details = {
    url: apiRoutes.auth.keyClockResetPassword,
    payload,
    config: { headers: { 'Content-type': 'application/json' } }
  };
  try {
    const response = await axiosPost(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getUserProfile = async (accessToken: string) => {
  const details = {
    url: apiRoutes.users.userProfile,
    config: { headers: { Authorization: `Bearer ${accessToken}` } }
  };
  try {
    const response = await axiosGet(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const updateUserProfile = async (data: object) => {
  const url = apiRoutes.users.update;
  const payload = data;

  const config = getHeaderConfigs();

  const axiosPayload = {
    url,
    payload,
    config
  };

  try {
    return await axiosPut(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const verifyUserMail = async (payload: IEmailVerifyData) => {
  const details = {
    url: `${apiRoutes.auth.verifyEmail}?verificationCode=${payload?.verificationCode}&email=${payload?.email}`,
    config: { headers: { 'Content-type': 'application/json' } }
  };
  try {
    const response = await axiosGet(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const checkUserExist = async (payload: string) => {
  const details = {
    url: `${apiRoutes.users.checkUser}${payload}`,
    config: { headers: { 'Content-type': 'application/json' } }
  };
  try {
    const response = await axiosGet(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const addPasswordDetails = async (payload: IAddPasswordDetails) => {
  const details = {
    url: `${apiRoutes.auth.addDetails}`,
    payload,
    config: { headers: { 'Content-type': 'application/json' } }
  };
  try {
    const response = await axiosPost(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const passwordEncryption = (password: string): string => {
  const CRYPTO_PRIVATE_KEY: string =
    process.env.NEXT_PUBLIC_CRYPTO_PRIVATE_KEY!;
  const encryptedPassword: string = CryptoJS.AES.encrypt(
    JSON.stringify(password),
    CRYPTO_PRIVATE_KEY
  ).toString();
  return encryptedPassword;
};
