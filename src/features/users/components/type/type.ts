import { Invitation } from '@/features/invitations/interfaces/invitation-interface'
import { User } from '../users-interface'

export interface TabDataProps {
  activeTab: string
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
  searchText: string
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setInviteModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  usersLoading: boolean
  usersList: User[] | null
  editUserRole: (user: User) => void
  usersPageState: InitialPageState
  usersPaginationInfo: UsersPaginationInfo
  handleUsersPageChange: (page: number) => void
  invitationsLoading: boolean
  invitationsList: Invitation[] | null
  setSelectedInvitation: React.Dispatch<React.SetStateAction<string>>
  setShowDeletePopup: React.Dispatch<React.SetStateAction<boolean>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
  setMessage: React.Dispatch<React.SetStateAction<string | null>>
  invitationsPageState: InitialPageState
  invitationsPaginationInfo: InitialPaginationInfo
  handleInvitationsPageChange: (page: number) => void
  hasAdminRights: boolean
}

interface InitialPageState {
  pageNumber: number
  pageSize: number
  search: string
  sortBy: string
  sortingOrder: string
  total: number
}

interface UsersPaginationInfo {
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: number
  previousPage: number
  lastPage: number
}

interface InitialPaginationInfo {
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: number
  previousPage: number
  lastPage: number
}
