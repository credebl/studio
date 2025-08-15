import * as yup from 'yup'

import { Field, Form, Formik } from 'formik'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ISharedAgentForm } from '../organization/components/interfaces/organization'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LedgerConfig from './LedgerConfig'
import Loader from '@/components/Loader'

const SharedAgentForm = ({
  orgName,
  orgId,
  maskedSeeds,
  seeds,
  ledgerConfig,
  setLedgerConfig,
  submitSharedWallet,
}: ISharedAgentForm): React.JSX.Element => {
  const [walletName, setWalletName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="mt-4 flex-col gap-4">
      {!ledgerConfig && (
        <Formik
          initialValues={{ walletName: '' }}
          validationSchema={yup.object().shape({
            walletName: yup.string().required('Wallet name is required'),
          })}
          onSubmit={async (values) => {
            setIsLoading(true)
            setWalletName(values.walletName)

            setTimeout(() => {
              setLedgerConfig(true)
              setIsLoading(false)
            }, 300)
          }}
        >
          {({ errors, touched }) => (
            <Form className="mt-4 max-w-lg space-y-4">
              <div>
                <Label htmlFor="walletName">Wallet Name</Label>
                <Field
                  as={Input}
                  id="walletName"
                  name="walletName"
                  type="text"
                  className="mt-4"
                  placeholder="Enter wallet name"
                />
                {errors.walletName && touched.walletName && (
                  <span className="text-destructive text-sm font-medium">
                    {errors.walletName}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader /> : 'Continue to Ledger Setup'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}

      {ledgerConfig && (
        <LedgerConfig
          orgName={orgName}
          orgId={orgId}
          maskedSeeds={maskedSeeds}
          seeds={seeds}
          submitSharedWallet={submitSharedWallet}
          walletName={walletName}
        />
      )}
    </div>
  )
}

export default SharedAgentForm
