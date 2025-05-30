import { Button } from './ui/button'
import React from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  height?: string
  buttonContent?: string
  svgComponent?: React.ReactNode
  onClick?: () => void
}

export const EmptyMessage = ({
  title,
  description,
  height = '300px',
  buttonContent,
  svgComponent,
  onClick,
}: EmptyStateProps): React.JSX.Element => (
  <div
    className="flex flex-col items-center justify-center space-y-4 text-center"
    style={{ height }}
  >
    {svgComponent && <div>{svgComponent}</div>}

    <h1 className="text-2xl font-bold">{title}</h1>

    {description && (
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    )}

    {buttonContent && onClick && (
      <Button
        onClick={onClick}
        className="bg-primary hover:bg-primary/90 mt-2 rounded-lg px-4 py-2"
      >
        {buttonContent}
      </Button>
    )}
  </div>
)
