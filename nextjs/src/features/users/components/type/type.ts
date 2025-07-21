import { Invitation } from '@/features/invitations/interfaces/invitation-interface'
import { User } from '../users-interface'

export interface tabDataProps {
  activeTab: string
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
  searchText: string
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setInviteModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  usersLoading: boolean
  usersList: User[] | null
  editUserRole: (user: User) => void
  usersPageState: initialPageState
  usersPaginationInfo: usersPaginationInfo
  handleUsersPageChange: (page: number) => void
  invitationsLoading: boolean
  invitationsList: Invitation[] | null
  setSelectedInvitation: React.Dispatch<React.SetStateAction<string>>
  setShowDeletePopup: React.Dispatch<React.SetStateAction<boolean>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
  setMessage: React.Dispatch<React.SetStateAction<string | null>>
  invitationsPageState: initialPageState
  invitationsPaginationInfo: initialPaginationInfo
  handleInvitationsPageChange: (page: number) => void
  hasAdminRights: boolean
}

interface initialPageState {
  pageNumber: number
  pageSize: number
  search: string
  sortBy: string
  sortingOrder: string
  total: number
}

interface usersPaginationInfo {
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: number
  previousPage: number
  lastPage: number
}

interface initialPaginationInfo {
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: number
  previousPage: number
  lastPage: number
}
