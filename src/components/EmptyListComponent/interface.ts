import type { ReactElement } from "react"

export interface IEmptyListMessage {
	message: string,
	description: string,
	buttonContent?: string,
	svgComponent?: ReactElement,
	feature?: string
	onClick?: () => void,
	noExtraHeight?: boolean
}
