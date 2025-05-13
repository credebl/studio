import * as yup from 'yup'

import { Field, Form, Formik } from 'formik'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DedicatedLedgerConfig from './DedicatedAgentLedgerConfig'
import { IDedicatedAgentForm } from '../organization/components/interfaces/organization'
import React from 'react'
import { useRouter } from 'next/navigation'

const DedicatedAgentForm = ({
  ledgerConfig,
  maskedSeeds,
  setLedgerConfig,
  seeds,
  submitDedicatedWallet,
  setAgentConfig,
}: IDedicatedAgentForm) => {
  const router = useRouter()

  return (
    <div className="mt-4 flex-col gap-4">
      {!ledgerConfig && (
        <Formik
          initialValues={{ walletName: '', agentEndpoint: '', apiKey: '' }}
          validationSchema={yup.object().shape({
            walletName: yup.string().required('Wallet name is required'),
            agentEndpoint: yup.string().required('Agent Endpoint is required'),
            apiKey: yup.string().required('API Key is required'),
          })}
          onSubmit={(values) => {
            setAgentConfig({
              walletName: values.walletName,
              agentEndpoint: values.agentEndpoint,
              apiKey: values.apiKey,
            })
            setLedgerConfig(true)
          }}
        >
          {(formikHandlers) => (
            <Form className="mt-4 max-w-lg">
              <div className="mb-4">
                <label htmlFor="walletName">Wallet Name</label>

                <Field
                  id="walletName"
                  name="walletName"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 sm:text-sm dark:bg-gray-700"
                  type="text"
                  placeholder="Enter wallet name"
                />
                {formikHandlers.errors.walletName &&
                  formikHandlers.touched.walletName && (
                    <span className="text-xs text-red-500">
                      {formikHandlers.errors.walletName}
                    </span>
                  )}
              </div>

              <div className="mb-4">
                <label htmlFor="agentEndpoint">Agent Endpoint</label>
                <Field
                  id="agentEndpoint"
                  name="agentEndpoint"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 sm:text-sm dark:bg-gray-700"
                  type="text"
                  placeholder="https://agent.example.com"
                />
                {formikHandlers.errors.agentEndpoint &&
                  formikHandlers.touched.agentEndpoint && (
                    <span className="text-xs text-red-500">
                      {formikHandlers.errors.agentEndpoint}
                    </span>
                  )}
              </div>

              <div className="mb-4">
                <label htmlFor="apiKey">API Key</label>
                <Field
                  id="apiKey"
                  name="apiKey"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 sm:text-sm dark:bg-gray-700"
                  type="text"
                  placeholder="Enter API key"
                />
                {formikHandlers.errors.apiKey &&
                  formikHandlers.touched.apiKey && (
                    <span className="text-xs text-red-500">
                      {formikHandlers.errors.apiKey}
                    </span>
                  )}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="secondary"
                  onClick={() =>
                    router.push(
                      '/organizations/create-organization?createOrg=true',
                    )
                  }
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Create Organization
                </Button>

                <Button type="submit">Continue to Ledger Setup</Button>
              </div>
            </Form>
          )}
        </Formik>
      )}

      {ledgerConfig && (
        <DedicatedLedgerConfig
          seeds={seeds}
          // walletName={walletName}
          maskedSeeds={maskedSeeds}
          // agentEndpoint={agentEndpoint}
          // apiKey={apiKey}
          submitDedicatedWallet={submitDedicatedWallet}
          ledgerConfig={false}
          setLedgerConfig={function (value: boolean): void {
            throw new Error('Function not implemented.')
          }}
          setAgentConfig={undefined}
          onConfigureDedicated={function (): void {
            throw new Error('Function not implemented.')
          }}
        />
      )}
    </div>
  )
}

export default DedicatedAgentForm
