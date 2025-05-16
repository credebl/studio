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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRef } from 'react'

const EditModal = (props: {
  openModal: boolean
  closeModal: (flag: boolean) => void
  onSucess: (name: string) => void
}): React.JSX.Element => {
  interface nameValue {
    name: string
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formikRef = useRef<any>(null)

  const saveName = (values: nameValue): void => {
    props.onSucess(values.name)
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
            initialValues={{ name: '' }}
            validationSchema={yup.object().shape({
              name: yup.string().required('Name is required').trim(),
            })}
            onSubmit={(values: nameValue) => saveName(values)}
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 25 25"
                      className="mr-2"
                    >
                      <path
                        fill="#fff"
                        d="M22.758 5.366a.833.833 0 0 0-1.366.95 10.826 10.826 0 0 1-5.647 16.518 10.838 10.838 0 0 1-12.909-5.438 10.825 10.825 0 0 1-1.17-4.89 10.893 10.893 0 0 1 7.742-10.38.835.835 0 1 0-.475-1.6 12.5 12.5 0 0 0-8.74 9.792 12.49 12.49 0 0 0 4.834 12.2A12.502 12.502 0 0 0 25 12.505a12.417 12.417 0 0 0-2.242-7.139Z"
                      />
                      <path
                        fill="#fff"
                        d="M15.59 2.13a10.786 10.786 0 0 1 3.575 1.875.834.834 0 0 0 1.033-1.308A12.419 12.419 0 0 0 16.032.531a.835.835 0 0 0-.476 1.6h.034Zm-3.684-.69a.958.958 0 0 0 .275.174.784.784 0 0 0 .634 0 .966.966 0 0 0 .275-.175.83.83 0 0 0 .242-.591.875.875 0 0 0-.242-.592.833.833 0 0 0-.758-.241.542.542 0 0 0-.15.05.617.617 0 0 0-.15.075l-.126.1a.833.833 0 0 0-.175.275.833.833 0 0 0 0 .65c.043.1.102.193.175.274Zm-6.75 9.92a.95.95 0 0 0 0 1.35l4.767 4.798a.95.95 0 0 0 1.35 0l8.567-8.605a.969.969 0 1 0-1.35-1.391l-7.9 7.897-4.083-4.049a.959.959 0 0 0-1.35 0Z"
                      />
                    </svg>
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
