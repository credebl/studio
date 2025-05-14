import {
  IOrganisation,
  OrgRole,
} from '@/features/organization/components/interfaces/organization'

export interface Invitation {
  id: string
  createDateTime: string
  createdBy: string
  lastChangedDateTime: string
  lastChangedBy: string
  deletedAt: Date | string
  userId: string
  orgId: string
  status: string
  orgRoles: OrgRole[]
  email: string
  organisation: IOrganisation
}

export interface SendInvitationModalProps {
  getAllSentInvitations?: () => void
  flag?: boolean
  openModal: boolean
  setMessage: (message: string) => void
  setOpenModal: (flag: boolean) => void
}

export interface RoleI {
  id: string
  name: string
}
