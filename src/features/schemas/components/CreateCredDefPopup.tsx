import * as yup from 'yup'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AnimatedCircle, ResetIcon } from '@/config/svgs/CreateCredDef'
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
  createLoader: boolean
  success: string | null
  failure: string | null
  closeAlert: () => void
}
const CreateCredDefPopup = (props: IProps): React.JSX.Element => (
  <Dialog
    open={props.openModal}
    onOpenChange={(value) => {
      if (!props.createLoader) {
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
              props.onSuccess(values)
              formikHandlers.resetForm()
            }}
          >
            {(formikHandlers): React.JSX.Element => (
              <Form onSubmit={formikHandlers.handleSubmit}>
                <div className="flex items-center space-x-4">
                  <div className="w-full">
                    <div className="mb-2 block text-sm font-medium">
                      <Label htmlFor="credential-definition">
                        Name<span className="text-destructive">*</span>
                      </Label>
                    </div>

                    <Field
                      id="tagName"
                      name="tagName"
                      placeholder="Enter Credential definition"
                      className="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      disabled={props.createLoader}
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
                  {props.createLoader && (
                    <div className="ml-auto">
                      <p className="ml-5 text-sm italic">
                        <AnimatedCircle />
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
                          onClick={() => props.closeAlert()}
                        >
                          <X
                            className={`${
                              props.success ? 'success-alert' : 'failure-alert'
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
                      title="Create new credential-definition"
                      disabled={props.createLoader}
                      className="flex items-center rounded-lg py-1 text-center text-base font-medium sm:w-auto"
                    >
                      <Plus />
                      Create
                    </Button>
                  </div>
                  <div className="float-right px-2 py-4">
                    <Button
                      type="reset"
                      disabled={props.createLoader}
                      variant="outline"
                      className="flex items-center rounded-xl border px-4 py-2 transition-colors"
                    >
                      <ResetIcon />
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
)
export default CreateCredDefPopup
