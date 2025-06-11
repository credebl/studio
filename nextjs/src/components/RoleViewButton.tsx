import { Features, Roles } from '@/common/enums'
import { JSX, ReactElement } from 'react'

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
  const roles = useAppSelector(
    (state) => state.organization.orgInfo?.roles || [],
  )

  const isRoleAccess = (): boolean => {
    switch (feature) {
      case Features.CRETAE_ORG:
        return true

      case Features.ISSUANCE:
        return (
          roles.includes(Roles.OWNER) ||
          roles.includes(Roles.ADMIN) ||
          roles.includes(Roles.ISSUER)
        )

      case Features.VERIFICATION:
        return (
          roles.includes(Roles.OWNER) ||
          roles.includes(Roles.ADMIN) ||
          roles.includes(Roles.VERIFIER)
        )

      default:
        return roles.includes(Roles.OWNER) || roles.includes(Roles.ADMIN)
    }
  }

  return (
    <Button
      title={title}
      data-outline={Boolean(isOutline)}
      onClick={isRoleAccess() ? onClickEvent : undefined}
      disabled={disabled || !isRoleAccess()}
    >
      {svgComponent}
      {buttonTitle}
    </Button>
  )
}

export default RoleViewButton
