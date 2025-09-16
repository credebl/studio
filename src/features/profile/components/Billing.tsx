'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { JSX } from 'react'

export default function Billing(): JSX.Element {
  const plans = [
    {
      name: 'FREE',
      current: true,
      features: [
        'Organizations: 2',
        'Wallets: 1 Wallet on Shared Agent/ Org',
        'Schema: 5/Org',
        'Cred-def: 10/Schema',
        'Users: 5/Org',
        'Credentials Issuance: 500/Org/Month',
        'Credentials Verification: 500/Org/Month',
        'Bulk Issuance: 50/batch',
        'Network Agent: Indicio [TestNet, DemoNet], Bcovrin [testnet] and Polygon [testnet]',
        'Technical support: Community',
        'Customizations: Not Available',
        'White Labeling: Not Available',
      ],
    },
    {
      name: 'PRO',
      current: false,
      message:
        'Please contact us at sales@sovio.id to learn more about the PRO plan features.',
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      {/* --------- Current Plan Card --------- */}
      <Card className="rounded-2xl border p-6 shadow-sm">
        <div className="flex w-full items-center justify-between">
          <p className="text-md">
            You are currently using a <strong>Free plan</strong> with limited
            usage. Upgrade to avoid any interruptions.
          </p>
        </div>
      </Card>

      {/* --------- Available Plans Section --------- */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className="flex flex-col rounded-2xl border p-6 shadow-sm"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
              {/* If PRO Plan → Only message */}
              {plan.message ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-center text-sm text-gray-600">
                    {plan.message}
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {plan.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>

            {/* Button only for Free Plan */}
            {!plan.message && (
              <div className="mt-6">
                <Button variant="secondary" className="w-full">
                  Current Plan
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
