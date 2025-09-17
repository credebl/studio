'use client'

import { JSX } from 'react'

export default function Billing(): JSX.Element {
  const sovioLandingPageURL = process.env.NEXT_PUBLIC_SOVIO_LANDINGPAGE_URL
  const plans = [
    {
      name: 'FREE',
      buttonLabel: 'Current plan',
      features: [
        'Organizations: 2',
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
      link: `${sovioLandingPageURL}/billing`,
      buttonLabel: 'Contact Us',
      features: [
        'Organizations: Unlimited',
        'Schema: Unlimited',
        'Cred-def: Unlimited',
        'Users: Unlimited',
        'Credentials Unlimited',
        'Credentials Verification: Unlimited',
        'Bulk Issuance: Unlimited',
        'Network Agent: Indicio [TestNet, DemoNet, MainNet], Bcovrin [testnet] and Polygon [MainNet]',
        'Technical support: Dedicated',
        'Customizations: Available',
        'White Labeling: Available',
      ],
    },
  ]

  return (
    <>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-2xl border p-6 shadow-md">
              <h2 className="mb-4 text-2xl font-bold">{plan.name}</h2>

              <ul className="mb-6 space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600">✔</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={plan.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full rounded-lg px-4 py-2 text-center font-medium ${
                  plan.name === 'FREE'
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-black'
                }`}
              >
                {plan.buttonLabel}
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
