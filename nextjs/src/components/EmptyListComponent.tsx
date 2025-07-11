import type { IEmptyListMessage } from './types/EmptyListComponent'
import { JSX } from 'react'
import RoleViewButton from './RoleViewButton'

export const EmptyListMessage = ({
  message,
  description,
  buttonContent,
  svgComponent,
  onClick,
  feature,
  noExtraHeight,
}: IEmptyListMessage): JSX.Element => (
  <div
    className={`flex ${noExtraHeight ? '' : 'mt-20 mb-16'} flex-col items-center justify-start`}
  >
    <p className="mb-4 text-2xl font-bold dark:text-white">{message}</p>
    <p className="mb-4 text-lg dark:text-white">{description}</p>
    {buttonContent && (
      <RoleViewButton
        buttonTitle={buttonContent}
        feature={feature as string}
        svgComponent={svgComponent}
        onClickEvent={onClick}
      />
    )}
  </div>
)
