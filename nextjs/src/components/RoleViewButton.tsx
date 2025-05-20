'use client'

import { Features, Roles } from '../common/enums'
import { ReactElement, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { RootState } from '@/lib/store'
import { useSelector } from 'react-redux'

interface RoleViewButtonProps {
  title?: string
  buttonTitle?: string
  svgComponent?: ReactElement
  onClickEvent?: () => void
  feature: string
  isOutline?: boolean
  isPadding?: boolean
  disabled?: boolean
}

const RoleViewButton = ({
  title,
  buttonTitle,
  svgComponent,
  onClickEvent,
  feature,
  disabled,
}: RoleViewButtonProps): ReactElement => {
  const [userRoles, setUserRoles] = useState<string[]>([])
  const roles =
    useSelector((state: RootState) => state.organization.orgInfo?.roles) || []

  const getUserOrgRoles = async (): Promise<void> => {
    setUserRoles(roles)
  }

  useEffect(() => {
    getUserOrgRoles()
  }, [])

  const isRoleAccess = (): boolean => {
    const isOwnerOrAdmin =
      userRoles.includes(Roles.OWNER) || userRoles.includes(Roles.ADMIN)
    if (feature === Features.CRETAE_ORG) {
      return true
    } else if (feature === Features.ISSUANCE) {
      if (isOwnerOrAdmin || userRoles.includes(Roles.ISSUER)) {
        return true
      }
      return false
    } else if (feature === Features.VERIFICATION) {
      if (isOwnerOrAdmin || userRoles.includes(Roles.VERIFIER)) {
        return true
      }
      return false
    } else if (isOwnerOrAdmin) {
      return true
    } else {
      return false
    }
  }

  return (
    <Button
      title={title}
      onClick={isRoleAccess() ? onClickEvent : undefined}
      className="text-base"
      disabled={disabled || !isRoleAccess()}
    >
      {svgComponent}
      {buttonTitle}
    </Button>
  )
}

export default RoleViewButton
