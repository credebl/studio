import * as yup from 'yup'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, Form, Formik } from 'formik'
import { Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Values } from '../type/schemas-interface'

interface IProps {
  openModal: boolean
  closeModal: (flag: boolean) => void
  onSuccess: (values: Values) => void
  isProcessing: boolean
  createloader: boolean
  success: string | null
  failure: string | null
  closeAlert: () => void
}
const CreateCredDefPopup = (props: IProps): React.JSX.Element => {
  const submitButtonTitle = {
    title: 'Create',
    svg: (
      <div className="pr-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            fill="#000"
            d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"
          />
        </svg>
      </div>
    ),
    tooltip: 'Create new credential-definition',
  }
  return (
    <>
      <Dialog
        open={props.openModal}
        onOpenChange={(value) => {
          if (!props.createloader) {
            props.closeModal(value)
          }
        }}
      >
        <DialogContent
          className="rounded-xl shadow-lg sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center text-xl font-bold">
              Create Credential Definition
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div>
              <Formik
                initialValues={{
                  tagName: '',
                  revocable: false,
                }}
                validationSchema={yup.object().shape({
                  tagName: yup
                    .string()
                    .trim()
                    .required('Credential Definition is required'),
                  revocable: yup.bool(),
                })}
                validateOnBlur
                validateOnChange
                enableReinitialize
                onSubmit={async (values, formikHandlers): Promise<void> => {
                  await props.onSuccess(values)
                  formikHandlers.resetForm()
                }}
              >
                {(formikHandlers): React.JSX.Element => (
                  <Form onSubmit={formikHandlers.handleSubmit}>
                    <div className="flex items-center space-x-4">
                      <div className="w-full">
                        <div className="mb-2 block text-sm font-medium">
                          <Label htmlFor="credential-definition">
                            Name
                            <span className="text-destructive">*</span>
                          </Label>
                        </div>

                        <Field
                          id="tagName"
                          name="tagName"
                          placeholder="Enter Credential definition"
                          className="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          disabled={props.createloader}
                        />
                        {formikHandlers?.errors?.tagName &&
                          formikHandlers?.touched?.tagName && (
                            <span className="text-destructive text-xs">
                              {formikHandlers?.errors?.tagName}
                            </span>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      {props.createloader && (
                        <div className="ml-auto">
                          <p className="ml-5 text-sm italic">
                            <svg
                              className="mr-1 inline-block h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.86 3.182 8.009l2.01-2.01zM12 20a8 8 0 008-8h-4a4 4 0 11-8 0H0a8 8 0 008 8v-4a4 4 0 018 0v4z"
                              ></path>
                            </svg>
                            Hold your coffee, this might take a moment...
                          </p>
                        </div>
                      )}
                    </div>
                    {(props.success || props.failure) && (
                      <div className="py-3">
                        <Alert
                          variant={props.failure ? 'destructive' : 'default'}
                          className={`relative ${
                            props.success ? 'success-alert' : 'failure-alert'
                          }`}
                        >
                          <div>
                            <Button
                              className="absolute top-3.5 right-5 m-0! h-fit w-fit border-none bg-transparent p-0! shadow-none hover:bg-transparent"
                              onClick={() => props.closeAlert}
                            >
                              <X
                                className={`${
                                  props.success
                                    ? 'success-alert'
                                    : 'failure-alert'
                                }`}
                                size={18}
                              />
                            </Button>
                          </div>
                          <AlertDescription>
                            {props.success || props.failure}
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    <div className="">
                      <div className="float-right px-2 py-4">
                        <Button
                          type="submit"
                          title={submitButtonTitle.tooltip}
                          disabled={props.createloader}
                          className="flex items-center rounded-lg py-1 text-center text-base font-medium sm:w-auto"
                        >
                          <Plus />
                          Create
                        </Button>
                      </div>
                      <div className="float-right px-2 py-4">
                        <Button
                          type="reset"
                          disabled={props.createloader}
                          variant="outline"
                          className="flex items-center rounded-xl border px-4 py-2 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="mr-1"
                          >
                            <path
                              fill="currentColor"
                              d="M19.414 9.414a.586.586 0 0 0-.586.586c0 4.868-3.96 8.828-8.828 8.828-4.868 0-8.828-3.96-8.828-8.828 0-4.868 3.96-8.828 8.828-8.828 1.96 0 3.822.635 5.353 1.807l-1.017.18a.586.586 0 1 0 .204 1.153l2.219-.392a.586.586 0 0 0 .484-.577V1.124a.586.586 0 0 0-1.172 0v.928A9.923 9.923 0 0 0 10 0a9.935 9.935 0 0 0-7.071 2.929A9.935 9.935 0 0 0 0 10a9.935 9.935 0 0 0 2.929 7.071A9.935 9.935 0 0 0 10 20a9.935 9.935 0 0 0 7.071-2.929A9.935 9.935 0 0 0 20 10a.586.586 0 0 0-.586-.586Z"
                            />
                          </svg>
                          Reset
                        </Button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
export default CreateCredDefPopup
