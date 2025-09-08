'use client'

import { GreenIndicator, RedIndicator } from '@/config/svgs/PasswordSuggestion'
import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react'

import { allowedPasswordChars } from '../../config/CommonConstant'

interface PasswordSuggestion {
  show: boolean
  value: string
}

type ValidatorKey =
  | 'setSmallAlpha'
  | 'setCapsAlpha'
  | 'setNumber'
  | 'setSplChar'

const rules: { regex: RegExp; setter: ValidatorKey }[] = [
  { regex: /[a-z]/, setter: 'setSmallAlpha' },
  { regex: /[A-Z]/, setter: 'setCapsAlpha' },
  { regex: /\d/, setter: 'setNumber' },
  { regex: /[!@#$%^*]/, setter: 'setSplChar' },
]

const PasswordSuggestionBox = ({
  show,
  value,
}: PasswordSuggestion): JSX.Element => {
  const [number, setNumber] = useState(false)
  const [splChar, setSplChar] = useState(false)
  const [smallAlpha, setSmallAlpha] = useState(false)
  const [capsAlpha, setCapsAlpha] = useState(false)
  const [minChar, setMinChar] = useState(false)
  const [restrictedChar, setRestrictedChar] = useState(false)

  const validators: Record<
    ValidatorKey,
    React.Dispatch<React.SetStateAction<boolean>>
  > = useMemo(
    () => ({
      setNumber,
      setSplChar,
      setSmallAlpha,
      setCapsAlpha,
    }),
    [setNumber, setSplChar, setSmallAlpha, setCapsAlpha],
  )

  const resetValidation = (): void => {
    setNumber(false)
    setSplChar(false)
    setSmallAlpha(false)
    setCapsAlpha(false)
    setMinChar(false)
    setRestrictedChar(false)
  }

  const validatePassword = useCallback(
    (password: string | null): void => {
      if (!password) {
        resetValidation()
        return
      }

      // Check restricted characters
      const invalidChars = allowedPasswordChars.exec(password)
      setRestrictedChar(invalidChars === null)

      // Apply regex rules safely
      rules.forEach(({ regex, setter }) => {
        validators[setter](regex.test(password))
      })

      // Minimum length check
      setMinChar(password.length >= 8)
    },
    [validators],
  )

  useEffect((): void => {
    validatePassword(value)
  }, [value, validatePassword])

  const matchedValue = value.match(allowedPasswordChars)

  const renderRule = (valid: boolean, label: string): JSX.Element => (
    <div
      className={`${valid ? 'green-text' : 'text-destructive'} flex items-center p-0.5`}
    >
      {valid ? <GreenIndicator /> : <RedIndicator />}
      {label}
    </div>
  )

  return (
    <div className="mt-4 ml-6">
      <div className="bg-popover absolute z-10 flex justify-end rounded-sm px-6 py-4 text-xs shadow-lg shadow-gray-500/50">
        {show && (
          <>
            {restrictedChar ? (
              <div className="text-primary-700 text-base">
                Password must contain:
                {renderRule(minChar, 'Minimum of 8 characters.')}
                {renderRule(capsAlpha, 'At least 1 uppercase letter.')}
                {renderRule(smallAlpha, 'At least 1 lowercase letter.')}
                {renderRule(number, 'At least 1 numeric character.')}
                {renderRule(splChar, 'At least 1 special character.')}
              </div>
            ) : (
              matchedValue && (
                <div className="text-red-700">
                  {matchedValue.length > 1
                    ? 'Following characters are not allowed: '
                    : 'Following character is not allowed: '}
                  <br />
                  <strong>{Array.from(new Set(matchedValue)).join(' ')}</strong>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PasswordSuggestionBox
