import * as yup from 'yup'

import { Field, Form, Formik } from 'formik'

import { Button } from '@/components/ui/button'
import DedicatedLedgerConfig from './DedicatedAgentLedgerConfig'
import { IDedicatedAgentForm } from '../organization/components/interfaces/organization'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

const DedicatedAgentForm = ({
  ledgerConfig,
  maskedSeeds,
  setLedgerConfig,
  seeds,
  submitDedicatedWallet,
  setAgentConfig,
}: IDedicatedAgentForm): React.JSX.Element => (
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
              <Label htmlFor="walletName">Wallet Name</Label>
              <Field
                as={Input}
                id="walletName"
                name="walletName"
                type="text"
                placeholder="Enter wallet name"
                className="mt-4"
              />
              {formikHandlers.errors.walletName &&
                formikHandlers.touched.walletName && (
                  <span className="text-xs text-red-500">
                    {formikHandlers.errors.walletName}
                  </span>
                )}
            </div>

            <div className="mb-4">
              <Label htmlFor="agentEndpoint">Agent Endpoint</Label>
              <Field
                as={Input}
                id="agentEndpoint"
                name="agentEndpoint"
                type="text"
                placeholder="https://agent.example.com"
                className="mt-4"
              />
              {formikHandlers.errors.agentEndpoint &&
                formikHandlers.touched.agentEndpoint && (
                  <span className="text-xs text-red-500">
                    {formikHandlers.errors.agentEndpoint}
                  </span>
                )}
            </div>

            <div className="mb-4">
              <Label htmlFor="apiKey">API Key</Label>
              <Field
                as={Input}
                id="apiKey"
                name="apiKey"
                type="text"
                placeholder="Enter API key"
                className="mt-4"
              />
              {formikHandlers.errors.apiKey &&
                formikHandlers.touched.apiKey && (
                  <span className="text-xs text-red-500">
                    {formikHandlers.errors.apiKey}
                  </span>
                )}
            </div>
            <div className="mt-6 flex items-center justify-between">
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
        setLedgerConfig={function (): void {
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

export default DedicatedAgentForm
