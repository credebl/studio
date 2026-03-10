import { AxiosResponse } from 'axios'
import { EcosystemRoles } from '@/features/common/enum'
import { ILeadsInvitationTable } from '../Interface/ecosystemInterface'
import { getEcosystemMemberInvitations } from '@/app/api/ecosystem'

interface IPaginationData {
  pageSize: number
  pageNumber: number
  totalPages: number
  searchTerm: string
  sortBy: string
  sortOrder: string
}

export const fetchInvitationsSentForMembers = async (
  orgId: string,
  ecosystemId: string,
  pagination: IPaginationData,
  role: EcosystemRoles = EcosystemRoles.ECOSYSTEM_LEAD,
): Promise<{
  tableData: ILeadsInvitationTable[] | []
  totalPages: number
  success: boolean
}> => {
  try {
    const response = await getEcosystemMemberInvitations(
      orgId,
      ecosystemId,
      pagination,
      role,
    )
    const { data } = response as AxiosResponse

    return {
      tableData: data?.data?.data || [],
      totalPages: data?.data?.totalPages || 0,
      success: true,
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return { tableData: [], totalPages: 0, success: false }
  }
}

const wait = (ms: number): Promise<number> =>
  new Promise((res) => setTimeout(res, ms))

export async function retryWithDelay<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) {
      throw error
    }
    await wait(delay)
    return retryWithDelay(fn, retries - 1, delay)
  }
}
