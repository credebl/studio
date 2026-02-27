import { getEcosystemMemberInvitations } from "@/app/api/ecosystem";
import { EcosystemRoles } from "@/features/common/enum";
import { AxiosResponse } from "axios";


interface IPaginationData {
    pageSize: number,
    pageNumber: number,
    totalPages: number,
    searchTerm: string,
    sortBy: string,
    sortOrder: string,
}

export const fetchInvitationsSentForMembers = async (
  orgId: string, 
  ecosystemId: string, 
  pagination: IPaginationData,
  role: EcosystemRoles = EcosystemRoles.ECOSYSTEM_LEAD
) => {
  try {
    const response = await getEcosystemMemberInvitations(orgId, ecosystemId, pagination, role);
    const { data } = response as AxiosResponse;
    
    return {
      tableData: data?.data?.data || [],
      totalPages: data?.data?.totalPages || 0,
      success: true
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { tableData: [], totalPages: 0, success: false };
  }
};