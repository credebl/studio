import { IContext } from '../type/BulkIssuance'

export const handleDiscardFile = (context: IContext): void => {
  context.setCsvData([])
  context.setIsFileUploaded(false)
  context.setUploadedFileName('')
  context.setUploadMessage(null)
}

export const onClear = (context: IContext): void => {
  if (context.selectInputRef.current) {
    context.selectInputRef.current.clearValue()
  }
}

export const handleReset = (context: IContext): void => {
  handleDiscardFile(context)
  context.setCredentialSelected(null)
  context.setSuccess(null)
  onClear(context)
}
