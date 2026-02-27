'use client'
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Link2,
  ShieldCheck,
  KeyRound,
  Globe,
  ChevronRight,
  Check,
  X,
  Clock,
  Building2,
  User,
  CalendarDays,
  Mail,
  BadgeCheck,
  AlertCircle,
  Menu,
  XIcon,
  RefreshCw,
  MailWarning,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchInvitationsSentForMembers } from "../utils/commonFunctions";
import { EcosystemMemberInvitation, EcosystemRoles } from "@/features/common/enum";
import { dateConversion } from '@/utils/DateConversion'
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SearchInput from "@/components/SearchInput";
import { acceptRejectMemberInvitation } from "@/app/api/ecosystem";
import { AxiosResponse } from "axios";
import { apiStatusCodes } from "@/config/CommonConstant";
import { useRouter } from "next/navigation";
import { AlertComponent } from "@/components/AlertComponent";

interface Invitation {
  id: string;
  organization: string;
  invitedBy: string;
  inviterEmail: string;
  role: string;
  date: string;
  expiresAt: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  message?: string;
}

const mockInvitations: Invitation[] = [
  {
    id: "1",
    organization: "Acme Corp",
    invitedBy: "Jhons Eco",
    inviterEmail: "john@ecosystem.io",
    role: "Member",
    date: "22 Jan 2026",
    expiresAt: "22 Feb 2026",
    status: "pending",
    message: "We'd love to have you join our ecosystem for credential sharing.",
  },
  {
    id: "2",
    organization: "Kamala University",
    invitedBy: "Admin Office",
    inviterEmail: "admin@kamala.edu",
    role: "Issuer",
    date: "22 Jan 2026",
    expiresAt: "28 Feb 2026",
    status: "pending",
    message: "Join as a credential issuer in our academic verification ecosystem.",
  },
  {
    id: "3",
    organization: "HealthChain",
    invitedBy: "Dr. Smith",
    inviterEmail: "smith@healthchain.org",
    role: "Verifier",
    date: "18 Jan 2026",
    expiresAt: "18 Feb 2026",
    status: "accepted",
  },
  {
    id: "4",
    organization: "SupplyNet",
    invitedBy: "Alice Cooper",
    inviterEmail: "alice@supplynet.co",
    role: "Member",
    date: "10 Jan 2026",
    expiresAt: "10 Feb 2026",
    status: "expired",
  },
];

const statusConfig = {
  pending: { label: "Pending", className: "bg-warning/15 text-warning border-warning/20" },
  accepted: { label: "Accepted", className: "bg-success/15 text-success border-success/20" },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive border-destructive/20" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground border-border" },
};

const MemberInvite = () => {
  const [invitations, setInvitations] = useState<EcosystemMemberInvitation>();

  const orgId = useAppSelector((state) => state.organization.orgId)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tableData, setTableData] = useState<any[]>([])
  const [orgLoading, setOrgLoading] = useState(false)
  const [reloading, setReloading] = useState<boolean>(false)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [orgList, setOrgList] = useState<{ id: string, name: string }[]>([])
  const [selectedOption, setSelectedOption] = useState<string>('')
  const dispatch = useAppDispatch()
  const router = useRouter()

  const ecosystemId = useAppSelector((state) => state.ecosystem.id)
  const [pagination, setPagination] = useState({
    pageSize: 100,
    pageNumber: 0,
    totalPages: 0,
    searchTerm: '',
    sortBy: 'createDateTime',
    sortOrder: 'desc',
  })

  const fetchInvitations = async () => {
    setLoading(true);

    const result = await fetchInvitationsSentForMembers(orgId, ecosystemId, pagination, EcosystemRoles.ECOSYSTEM_MEMBER);

    if (result.success) {
      setInvitations(result.tableData);
      setPagination((prev) => ({ ...prev, totalPages: result.totalPages }));
    } else {
      console.error("Error fetching data:", error);
    }

    setLoading(false);
  }

  const handleResponse = async (orgId: string, status: EcosystemMemberInvitation, ecosystemId: string) => {
    const payload = {
      orgId,
      ecosystemId
    }
    try {
      const response = await acceptRejectMemberInvitation(status, payload)
      const { data } = response as AxiosResponse
      console.log("data", data)
      console.log("response", response)
      console.log("data.status", data.status)
      if (data && data.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        console.log("success", data.message)
        setSuccess(data.message)
        fetchInvitations()
      }
    } catch (err) {
      setError('Failed to update the invitation status')
    } finally {
      setLoading(false)
    }
  };


  const pendingCount = Array.isArray(invitations) ? invitations.filter((i) => i.status === "pending").length : 0;

  useEffect(()=>{
    setTimeout(()=>{
      setSuccess(null)
      setError(null)
    },3000)
  },[success,error])

  useEffect(() => {
    let timer: NodeJS.Timeout
    timer = setTimeout(() => {
      fetchInvitations()
    }, 500)
  }, [pagination.searchTerm])

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPagination((prev) => ({ ...prev, searchTerm: e.target.value }))
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}

      {/* Main Content */}

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Member Invitations</h1>
            {pendingCount > 0 && (
              <Badge variant="secondary" className="bg-warning/15 text-warning border border-warning/20 text-xs font-medium">
                {pendingCount} pending
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Review and manage invitations from ecosystem organizations.
          </p>
        </div>

        {/* Invitation List */}
        {
          (!!error || !!success) &&
          <AlertComponent
            message={success ?? error}
            type={success ? 'success' : 'failure'}
            onAlertClose={() => { setError(null); setSuccess(null) }}
          />
        }

        <Card className="px-4 py-6">
          <div className="flex justify-between mb-4">
            {/* <Input/> */}
            <SearchInput value={pagination.searchTerm} onInputChange={handleSearch} />
            <Button
              onClick={() => (fetchInvitations())}
              disabled={loading}
              variant={'ghost'}
              className="border rounded-lg"
            >
              <RefreshCw
                className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
          <div className="space-y-3">
            {Array.isArray(invitations) && invitations.map((invitation) => {
              const isPending = invitation.status === EcosystemMemberInvitation.PENDING;

              return (
                <div
                  key={invitation.id}
                  className={`group rounded-xl border bg-card transition-all duration-200 cursor-default`}
                >
                  {/* Main Row - stacks on mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 sm:p-5">
                    {/* Top section: Org + Status on mobile */}
                    <div className="flex items-center justify-between sm:justify-start gap-3 sm:min-w-[180px]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground leading-none mb-1">Organization</p>
                          <p className="text-sm font-semibold text-foreground leading-none">{invitation.organisation.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Middle details */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:flex-nowrap">
                      {/* Invited By */}
                      <div className="flex items-center gap-3 min-w-[140px]">
                        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground leading-none mb-1">Invited by</p>
                          <p className="text-sm font-medium text-foreground leading-none">{invitation.ecosystem.name}</p>
                        </div>
                      </div>


                      {/* Date */}
                      <div className="flex items-center gap-3 min-w-[110px]">
                        <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground leading-none mb-1">Received</p>
                          <p className="text-sm text-foreground leading-none">{dateConversion(invitation.createDateTime)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="sm:ml-auto flex items-center gap-2.5">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          className=""
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResponse(invitation.invitedOrg, EcosystemMemberInvitation.REJECTED, invitation.ecosystem.id);
                          }}
                        >
                          <X className="w-3.5 h-3.5 mr-1.5" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className=""
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResponse(invitation.invitedOrg, EcosystemMemberInvitation.ACCEPTED, invitation.ecosystem.id);
                          }}
                        >
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        {Array.isArray(invitations) && invitations.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <MailWarning className="w-12 h-12 mx-auto mb-4 opacity-30"/>
            <p className="text-lg font-medium">No invitations yet</p>
            <p className="text-sm mt-1">Invitations from ecosystem organizations will appear here.</p>
          </div>
        )}
        </Card>
      </div>
    </div>
  );
};

export default MemberInvite;