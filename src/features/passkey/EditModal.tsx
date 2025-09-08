'use client'

import * as yup from 'yup'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, Form, Formik } from 'formik'

import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRef } from 'react'

const EditModal = (props: {
  openModal: boolean
  closeModal: (flag: boolean) => void
  onSuccess: (name: string) => void
  initialName?: string
}): React.JSX.Element => {
  interface NameValue {
    name: string
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formikRef = useRef<any>(null)

  const saveName = (values: NameValue): void => {
    props.onSuccess(values.name)
    props.closeModal(false)
  }

  return (
    <Dialog
      open={props.openModal}
      onOpenChange={() => {
        formikRef.current?.resetForm()
        props.closeModal(false)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
        </DialogHeader>

        <div className="px-4 pt-2 pb-5">
          <Formik
            innerRef={formikRef}
            initialValues={{ name: props.initialName || '' }}
            enableReinitialize
            validationSchema={yup.object().shape({
              name: yup.string().required('Name is required').trim(),
            })}
            onSubmit={(values: NameValue) => saveName(values)}
          >
            {(formikHandlers) => (
              <Form className="space-y-6">
                <div>
                  <Label htmlFor="editPasskeyDevice" className="mb-4">
                    Name<span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Field
                    as={Input}
                    id="editPasskeyDevice"
                    name="name"
                    type="text"
                  />
                  {formikHandlers.errors.name &&
                    formikHandlers.touched.name && (
                      <p className="mt-1 text-xs text-red-500">
                        {formikHandlers.errors.name}
                      </p>
                    )}
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      formikHandlers.resetForm()
                      props.closeModal(false)
                    }}
                  >
                    No, cancel
                  </Button>
                  <Button type="submit">
                    <CheckCircle className="h-16 w-16" />
                    Submit
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditModal
