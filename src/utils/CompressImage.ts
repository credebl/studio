interface ICalculateSize {
  width: number
  height: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ev: any
}

export const dataURItoBlob = (dataURI: string, mimeString: string): Blob => {
  const byteString = atob(dataURI.split(',')[1])
  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}

interface IImageDimensions {
  width: number
  height: number
}

export const calculateSize = (
  e: IImageDimensions,
  maxWidth: number,
  maxHeight: number,
): ICalculateSize => {
  let { width } = e
  let { height } = e

  // calculate the width and height, constraining the proportions
  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width)
      width = maxWidth
    }
  } else if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height)
    height = maxHeight
  }
  return { width, height, ev: e }
}
