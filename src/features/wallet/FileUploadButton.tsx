'use client'

import { Button } from '@/components/ui/button'
import React from 'react'

interface FileUploadButtonProps {
  id: string
  label: string
  /** The file extensions the file picker offers, for example `.pem,.crt`. */
  accept: string
  multiple?: boolean
  onFiles: (files: File[]) => void | Promise<void>
}

/** A button that opens the file picker and hands the chosen files over, so nobody has to paste a file's text. */
export default function FileUploadButton({
  id,
  label,
  accept,
  multiple = false,
  onFiles,
}: FileUploadButtonProps): React.JSX.Element {
  const input = React.useRef<HTMLInputElement>(null)

  return (
    <>
      <input
        ref={input}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={async (event) => {
          const files = Array.from(event.target.files ?? [])
          // Reset so choosing the same file again still triggers a change.
          event.target.value = ''
          if (files.length > 0) {
            await onFiles(files)
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => input.current?.click()}
      >
        {label}
      </Button>
    </>
  )
}
