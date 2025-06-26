export interface IRegistrationOption {
  userName: string | null
  deviceFlag: boolean
}

export interface IAddPassword {
  password: string
}
export interface IVerifyRegistrationObj {
  id: string
  rawId: string
  response: object
  authenticatorAttachment?: AuthenticatorAttachment
  clientExtensionResults: AuthenticationExtensionsClientOutputs
  type: PublicKeyCredentialType
  challangeId: string
}

export interface IDeviceData {
  createDateTime: string
  deviceFriendlyName: string
  credentialId: string
  lastChangedDateTime: string
}

export interface IdeviceBody {
  userName: string
  credentialId: string
  deviceFriendlyName: string
}
export interface IDeviceDetails {
  enCodedUrl: string
  updatedDeviceName: string
}

export interface IUserEmail {
  email: string
}

export interface IUserProfile {
  id: string
  profileImg?: string
  username?: string
  email: string
  firstName: string
  lastName: string
  isEmailVerified?: boolean
  keycloakUserId?: string
  publicProfile?: boolean
  isPublic?: boolean
  roles: string
}

export interface IDisplayUserProfileProps {
  toggleEditProfile: () => void
  userProfileInfo: IUserProfile | null
}
