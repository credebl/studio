import * as yup from 'yup'
import { Field, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import DedicatedLedgerConfig from './DedicatedAgentLedgerConfig'
import { IDedicatedAgentForm } from '../organization/components/interfaces/organization'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from 'lucide-react'

const DedicatedAgentForm = ({
  ledgerConfig,
  orgId,
  maskedSeeds,
  setLedgerConfig,
  seeds,
  submitDedicatedWallet,
  setAgentConfig,
}: IDedicatedAgentForm): React.JSX.Element => {
  const [isContinueLoading, setIsContinueLoading] = useState(false)

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
            setIsContinueLoading(true)
            setAgentConfig({
              walletName: values.walletName,
              agentEndpoint: values.agentEndpoint,
              apiKey: values.apiKey,
            })
            setLedgerConfig(true)

            setTimeout(() => {
              setIsContinueLoading(false)
            }, 500)
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
                    <span className="text-destructive text-xs">
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
                    <span className="text-destructive text-xs">
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
                    <span className="text-destructive text-xs">
                      {formikHandlers.errors.apiKey}
                    </span>
                  )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Button type="submit" disabled={isContinueLoading}>
                  {isContinueLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Continue to Ledger Setup'
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}

      {ledgerConfig && (
        <DedicatedLedgerConfig
          orgId={orgId}
          seeds={seeds}
          maskedSeeds={maskedSeeds}
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
}

export default DedicatedAgentForm
