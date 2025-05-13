import * as yup from 'yup'

import { Field, Form, Formik } from 'formik'
import React, { useState } from 'react'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ISharedAgentForm } from '../organization/components/interfaces/organization'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LedgerConfig from './LedgerConfig'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  return (
    <div className="mt-4 flex-col gap-4">
      {!ledgerConfig && (
        <Formik
          initialValues={{ walletName: '' }}
          validationSchema={yup.object().shape({
            walletName: yup.string().required('Wallet name is required'),
          })}
          onSubmit={(values) => {
            setWalletName(values.walletName)
            setLedgerConfig(true)
          }}
        >
          {({ errors, touched }) => (
            <Form className="mt-4 max-w-lg space-y-4">
              <div>
                <Label htmlFor="walletName" className="m-4">
                  Wallet Name
                </Label>
                <Field
                  as={Input}
                  id="walletName"
                  name="walletName"
                  type="text"
                  placeholder="Enter wallet name"
                />
                {errors.walletName && touched.walletName && (
                  <p className="text-destructive text-sm font-medium">
                    {errors.walletName}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between pt-4">
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
