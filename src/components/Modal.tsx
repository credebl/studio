'use client'

import * as React from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { Button } from './ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const modalVariants = cva(
  'relative mx-auto my-auto flex flex-col rounded-lg border bg-background shadow-lg transition-all',
  {
    variants: {
      size: {
        default: 'max-w-md w-full max-h-[85vh]',
        sm: 'max-w-sm w-full max-h-[85vh]',
        lg: 'max-w-lg w-full max-h-[85vh]',
        xl: 'max-w-xl w-full max-h-[85vh]',
        full: 'max-w-[95vw] w-full max-h-[90vh]',
        auto: 'max-w-[95vw] max-h-[90vh]',
      },
    },
    defaultVariants: {
      size: 'auto',
    },
  },
)

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  open: boolean
  onClose: () => void
  closeOnOutsideClick?: boolean
  closeOnEsc?: boolean
}

export function Modal({
  children,
  className,
  size,
  open,
  onClose,
  closeOnOutsideClick = true,
  closeOnEsc = true,
  ...props
}: ModalProps): React.ReactNode {
  const [isClient, setIsClient] = React.useState(false)
  const modalRef = React.useRef<HTMLDivElement>(null)

  // Handle ESC key press
  React.useEffect(() => {
    if (!closeOnEsc) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return (): void => window.removeEventListener('keydown', handleKeyDown)
  }, [closeOnEsc, onClose, open])

  // Handle outside click
  React.useEffect(() => {
    if (!closeOnOutsideClick) {
      return
    }

    const handleOutsideClick = (e: MouseEvent): void => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        open
      ) {
        onClose()
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    return (): void =>
      window.removeEventListener('mousedown', handleOutsideClick)
  }, [closeOnOutsideClick, onClose, open])

  // Handle body scroll lock
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return (): void => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Handle client-side rendering
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }
  if (!open) {
    return null
  }

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div
        ref={modalRef}
        className={cn(modalVariants({ size }), className)}
        {...props}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-70 transition-opacity hover:opacity-100"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <div className="overflow-auto p-6">{children}</div>
      </div>
    </div>
  )
}
