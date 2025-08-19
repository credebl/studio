import type { ChangeEvent } from 'react'
import { imageSizeAccepted } from '../config/CommonConstant'

type ImageProcessCallback = (result: string | null, error?: string) => void

export const processImageFile = (
  event: ChangeEvent<HTMLInputElement>,
  callback: ImageProcessCallback,
): void => {
  const reader = new FileReader()
  const file = event?.target?.files
  if (file) {
    const fileSize = Number((file[0]?.size / 1024 / 1024)?.toFixed(2))
    const extension = file[0]?.name
      ?.substring(file[0]?.name?.lastIndexOf('.') + 1)
      ?.toLowerCase()

    if (
      (extension === 'png' || extension === 'jpeg' || extension === 'jpg') &&
      fileSize <= imageSizeAccepted
    ) {
      reader.onloadend = (): void => {
        callback(reader.result as string)
      }
      reader.readAsDataURL(file[0])
      event.preventDefault()
    } else {
      callback(
        null,
        extension === 'png' || extension === 'jpeg' || extension === 'jpg'
          ? 'Please check image size'
          : 'Invalid image type',
      )
    }
  }
}
