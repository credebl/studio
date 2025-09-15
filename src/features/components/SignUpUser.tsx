'use client'

import React, { useState } from 'react'

import EmailVerificationForm from './EmailVerificationForm'
import Footer from '@/components/Footer'
import Link from 'next/link'
import UserInfoForm from './UserInfoForm'
import { useSearchParams } from 'next/navigation'

export default function SignUpUser(): React.JSX.Element {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState<string>('')
  const searchParam = useSearchParams()
  const userEmail = searchParam.get('email')
  const redirectTo = searchParam.get('redirectTo')
  const clientAlias = searchParam.get('clientAlias')

  const signInUrl =
    redirectTo && clientAlias
      ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}&clientAlias=${clientAlias}`
      : '/sign-in'

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Subscription Message */}
      <div className="mb-4 w-full max-w-md rounded-md border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
        <p className="mt-1 text-sm">
          You are registering using <strong>Free plan</strong> with limited
          usage.
          <span className="ml-1">Upgrade to avoid any interruptions.</span>
        </p>
      </div>
      <div className="bg-card border-border relative z-10 h-full w-[480px] max-w-md overflow-hidden rounded-xl border p-8 shadow-xl transition-transform duration-300">
        <h2 className="mb-2 text-center text-xl font-semibold">
          Create an account
        </h2>

        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${step === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} `}
              >
                {s}
              </div>
              {i < 1 && (
                <div
                  className={`h-1 w-6 rounded-full ${
                    step > s ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <EmailVerificationForm
            email={userEmail ?? ''}
            setEmail={setEmail}
            goToNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <UserInfoForm
            email={email || userEmail || ''}
            goBack={() => setStep(1)}
          />
        )}

        <div className="text-muted-foreground mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href={signInUrl}>
            <span className="url-link hover:underline">Sign in</span>
          </Link>
        </div>
      </div>
      <Footer fixed={true} />
    </div>
  )
}
