import { Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';

const EditModal = (props: { openModal: boolean; closeModal: (flag: boolean) => void; onSucess: (name: string) => void }) => {
  const [name, setName] = useState<nameValue | null>(null)
  interface nameValue {
    name: string;
  }

  const saveName = (values: nameValue) => {
    props.onSucess(values.name)
    props.closeModal(false)
  }

  return (
    <Modal
      size="lg"
      show={props.openModal} onClose={() => props.closeModal(false)}>
      <Modal.Header>Edit Device</Modal.Header>
      <div className="relative p-2 text-center bg-white rounded-lg shadow dark:bg-gray-800 pr-5 pl-5">
        <Formik
          initialValues={{
            name: ''
          }}
          validationSchema={yup.object().shape({
            name: yup
              .string()
              .required('Email is required')
              .trim()
          })}
          validateOnBlur
          validateOnChange
          enableReinitialize
          onSubmit={(values: nameValue) => saveName(values)}
        >
          
          {(formikHandlers): JSX.Element => (
            <Form className="mt-5 mb-5 space-y-6" onSubmit={formikHandlers.handleSubmit}>
              <div>
                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  <Label htmlFor="email2" value="Name" className='float-left' />
                  <span className='text-red-500 text-xs float-left '>*</span>
                </div>
                <Field
                  id="editPasskeyDevice"
                  name="name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  type="name"
                />
                {
                  (formikHandlers?.errors?.name && formikHandlers?.touched?.name) &&
                  <span className="text-red-500 text-xs">{formikHandlers?.errors?.name}</span>
                }
              </div>

              <div className="flex justify-center items-center space-x-4 mb-4">
          <Button
            onClick={() => {

               props.closeModal(false)
            }}
            className="text-base font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-4 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            No, cancel
          </Button>
          <Button
          type="submit"
            className="text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          >
            Submit
          </Button>
        </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default EditModal;
