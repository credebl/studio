export interface RegistrationOptionInterface {
  userName: string,
  deviceFlag: boolean

}

export interface AddPassword {
  password: string,
}
export interface verifyRegistrationObjInterface {
  id: string;
  rawId: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
    transports: string[];
  };
  type: string;
  clientExtensionResults: {
    credProps: {
      rk: boolean;
    };
  };
  authenticatorAttachment: string;
  challangeId: string;
}

export interface IDeviceData {
  createDateTime: string
  deviceFriendlyName: string
  credentialId: string
  lastChangedDateTime: string
}

export interface IdeviceBody {
  userName: string,
  credentialId: string,
  deviceFriendlyName: string
}
export interface DeviceDetails {
  enCodedUrl: string,
  updatedDeviceName: string
}

export interface UserEmail {
  email: string
}

export interface UserProfile {
  id: number
  profileImg?: string
  username?: string
  email: string
  firstName: string
  lastName: string
  isEmailVerified?: boolean
  keycloakUserId?: string
  publicProfile?: boolean
  isPublic?:boolean
}
