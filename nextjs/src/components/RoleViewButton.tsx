'use client'

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Features } from '../common/enums';
import type { ReactElement } from 'react';
import { Roles } from '../common/enums';
import { RootState } from '@/lib/store';
import { useSelector } from 'react-redux';

interface RoleViewButtonProps {
	title?: string
	buttonTitle?: string,
	svgComponent?: ReactElement,
	onClickEvent?: () => void,
	feature: string,
	isOutline?: boolean,
	isPadding?: boolean,
	disabled?: boolean
}


const RoleViewButton = ({ title, buttonTitle, svgComponent, onClickEvent, feature, isOutline, isPadding, disabled }: RoleViewButtonProps) => {

	const [userRoles, setUserRoles] = useState<string[]>([])
	const roles = useSelector((state: RootState) => state.organization.orgInfo?.roles) || []


	const getUserOrgRoles = async () => {
		setUserRoles(roles)
	}

	useEffect(() => {
		getUserOrgRoles()
	}, [])

	const isRoleAccess = (): boolean => {

		if (feature === Features.CRETAE_ORG) {
			return true
		} else if (feature === Features.ISSUANCE) {
			if (userRoles.includes(Roles.OWNER)
				|| userRoles.includes(Roles.ADMIN)
				|| userRoles.includes(Roles.ISSUER)
			) {
				return true
			}
			return false
		} else if (feature === Features.VERIFICATION) {
			if (userRoles.includes(Roles.OWNER)
				|| userRoles.includes(Roles.ADMIN)
				|| userRoles.includes(Roles.VERIFIER)
			) {
				return true
			}
			return false
		} else if (userRoles.includes(Roles.OWNER) || userRoles.includes(Roles.ADMIN)) {
			return true
		} else {
			return false
		}

	}

	return (
		<Button
			title={title}
			onClick={isRoleAccess() ? onClickEvent : undefined}
			className='text-base'
			disabled={disabled || !isRoleAccess()}
		>
			{svgComponent}
			{buttonTitle}

		</Button>
	)

}

export default RoleViewButton
