'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { processImageFile } from '@/components/ProcessImage'

interface LogoUploaderProps {
  logoPreview: string
  setLogoPreview: (val: string) => void
  setFieldValue: (field: string, value: unknown) => void
  imgError: string
  setImgError: (val: string) => void
  existingLogoUrl?: string
}

export default function LogoUploader({
  logoPreview,
  setLogoPreview,
  setFieldValue,
  imgError,
  setImgError,
  existingLogoUrl,
}: Readonly<LogoUploaderProps>): React.JSX.Element {
  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    setImgError('')

    processImageFile(e, (result: string | null, error?: string) => {
      if (result) {
        setLogoPreview(result)
        setFieldValue('logoPreview', result)
      } else {
        setImgError(error || 'Image processing failed')
        setFieldValue('logoPreview', '')
      }
    })
  }

  return (
    <div>
      <Label className="mb-2 block pb-4">Organization Logo</Label>
      <div className="border-input flex items-center gap-4 rounded-md border p-4">
        <Avatar className="h-24 w-24 rounded-none">
          <AvatarImage
            src={
              logoPreview || existingLogoUrl || '/images/upload_logo_file.svg'
            }
            alt="Logo Preview"
            className="object-cover"
          />
          <AvatarFallback>Logo</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e)}
          />
          {imgError && (
            <p className="text-destructive mt-1 text-sm">{imgError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
