import { Features, Roles } from '@/common/enums';
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { Button } from '../ui/button';
import { useAppSelector } from '@/lib/hooks';

interface RoleViewButtonProps {
  title?: string;
  buttonTitle?: string;
  svgComponent?: ReactElement;
  onClickEvent?: () => void;
  feature: string;
  isOutline?: boolean;
  isPadding?: boolean;
  disabled?: boolean;
}

const RoleViewButton = ({
  title,
  buttonTitle,
  svgComponent,
  onClickEvent,
  feature,
  isOutline,
  isPadding,
  disabled
}: RoleViewButtonProps) => {
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const role = useAppSelector((state) => state.organization.orgInfo?.roles[0]);

  const getUserOrgRoles = async () => {
    setUserRoles(role ? [role] : []);
  };

  useEffect(() => {
    getUserOrgRoles();
  }, []);

  const isRoleAccess = (): boolean => {
    if (feature === Features.CRETAE_ORG) {
      return true;
    } else if (feature === Features.ISSUANCE) {
      if (
        userRoles.includes(Roles.OWNER) ||
        userRoles.includes(Roles.ADMIN) ||
        userRoles.includes(Roles.ISSUER)
      ) {
        return true;
      }
      return false;
    } else if (feature === Features.VERIFICATION) {
      if (
        userRoles.includes(Roles.OWNER) ||
        userRoles.includes(Roles.ADMIN) ||
        userRoles.includes(Roles.VERIFIER)
      ) {
        return true;
      }
      return false;
    } else if (
      userRoles.includes(Roles.OWNER) ||
      userRoles.includes(Roles.ADMIN)
    ) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <Button
      title={title}
      data-outline={Boolean(isOutline)}
      onClick={isRoleAccess() ? onClickEvent : undefined}
      color={isOutline ? 'bg-primary-800' : 'bg-primary-700'}
      className={`${
        isOutline
          ? 'role-btn group ring-primary-700 bg-white-700 hover:bg-secondary-700 dark:hover:text-primary-700 flex h-min items-center justify-center rounded-md !p-0 text-center text-sm font-medium text-black ring-2 focus:z-10 focus:ring-2 dark:text-white'
          : `${isPadding ? '!p-0' : ''} bg-primary-700 hover:!bg-primary-800 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 rounded-md text-center text-base font-medium text-white focus:ring-4 sm:w-auto`
      }`}
      disabled={disabled || !isRoleAccess()}
    >
      {svgComponent}
      {buttonTitle}
    </Button>
  );
};

export default RoleViewButton;
