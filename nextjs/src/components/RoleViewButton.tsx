import { Features, Roles } from '@/common/enums'
import { JSX, ReactElement, useEffect, useState } from 'react'

import { Button } from './ui/button'
import { useAppSelector } from '@/lib/hooks'

interface RoleViewButtonProps {
  title?: string
  buttonTitle?: string
  svgComponent?: ReactElement | JSX.Element
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
  isOutline,
  disabled,
}: RoleViewButtonProps): JSX.Element => {
  const [userRoles, setUserRoles] = useState<string[]>([])

  const role = useAppSelector((state) => state.organization.orgInfo?.roles[0])

  const getUserOrgRoles = async (): Promise<void> => {
    setUserRoles(role ? [role] : [])
  }

  useEffect(() => {
    getUserOrgRoles()
  }, [])

  const isRoleAccess = (): boolean => {
    if (feature === Features.CRETAE_ORG) {
      return true
    } else if (feature === Features.ISSUANCE) {
      if (
        userRoles.includes(Roles.OWNER) ||
        userRoles.includes(Roles.ADMIN) ||
        userRoles.includes(Roles.ISSUER)
      ) {
        return true
      }
      return false
    } else if (feature === Features.VERIFICATION) {
      if (
        userRoles.includes(Roles.OWNER) ||
        userRoles.includes(Roles.ADMIN) ||
        userRoles.includes(Roles.VERIFIER)
      ) {
        return true
      }
      return false
    } else if (
      userRoles.includes(Roles.OWNER) ||
      userRoles.includes(Roles.ADMIN)
    ) {
      return true
    } else {
      return false
    }
  }

  return (
    <Button
      title={title}
      data-outline={Boolean(isOutline)}
      onClick={isRoleAccess() ? onClickEvent : undefined}
      // color={isOutline ? 'bg-primary' : 'bg-primary'}
      disabled={disabled || !isRoleAccess()}
    >
      {svgComponent}
      {buttonTitle}
    </Button>
  )
}

export default RoleViewButton
