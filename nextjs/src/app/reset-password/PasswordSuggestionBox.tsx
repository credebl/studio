'use client'

import { GreenIndicator, RedIndicator } from '@/config/svgs/PasswordSuggestion'
import React, { JSX, useEffect, useState } from 'react'

import { allowedPasswordChars } from '../../config/CommonConstant'

interface PasswordSuggestion {
  show: boolean
  value: string
}
const PasswordSuggestionBox = ({
  show,
  value,
}: PasswordSuggestion): JSX.Element => {
  const [number, validateNumber] = useState(false)
  const [splChar, validateSplChar] = useState(false)
  const [smallAlpha, validateSmallAlpha] = useState(false)
  const [capsAlpha, validateCapsAlpha] = useState(false)
  const [minChar, validateMinChar] = useState(false)
  const [restrictedChar, validateRestrictedChar] = useState(false)

  const onChangeSuggest = (value: string | null): void => {
    if (value) {
      const passwordValue = value.match(allowedPasswordChars)
      if (passwordValue === null) {
        validateRestrictedChar(true)
      } else {
        validateRestrictedChar(false)
      }
      const lowerCaseLetters = /[a-z]/g
      if (value.match(lowerCaseLetters)) {
        validateSmallAlpha(true)
      } else {
        validateSmallAlpha(false)
      }

      const upperCaseLetters = /[A-Z]/g
      if (value.match(upperCaseLetters)) {
        validateCapsAlpha(true)
      } else {
        validateCapsAlpha(false)
      }

      const numbers = /[0-9]/g
      if (value.match(numbers)) {
        validateNumber(true)
      } else {
        validateNumber(false)
      }
      const splCharacter = /[!@#$%^*]/g
      if (value.match(splCharacter)) {
        validateSplChar(true)
      } else {
        validateSplChar(false)
      }

      if (value.length >= 8) {
        validateMinChar(true)
      } else {
        validateMinChar(false)
      }
    }
  }

  useEffect(() => {
    onChangeSuggest(value)
  }, [value])

  const matchedValue = value.match(allowedPasswordChars)

  return (
    <div className="mt-4 ml-6">
      <div className="absolute z-10 flex justify-end rounded-sm bg-popover px-6 py-4 text-xs shadow-lg shadow-gray-500/50">
        {show === true ? (
          <>
            {restrictedChar ? (
              <>
                <label></label>
                <div className="">
                  <div className="text-primary-700 text-base">
                    Password must contains :
                    <div
                      className={
                        minChar
                          ? 'green-text flex items-center p-0.5'
                          : 'text-destructive flex items-center p-0.5'
                      }
                    >
                      {minChar ? <GreenIndicator /> : <RedIndicator />}
                      Minimum of 8 characters.
                    </div>
                    <div
                      className={
                        capsAlpha
                          ? 'green-text flex items-center p-0.5'
                          : 'text-destructive flex items-center p-0.5'
                      }
                    >
                      {capsAlpha ? <GreenIndicator /> : <RedIndicator />}
                      At least 1 uppercase letter.
                    </div>
                    <div
                      className={
                        smallAlpha
                          ? 'green-text flex items-center p-0.5'
                          : 'text-destructive flex items-center p-0.5'
                      }
                    >
                      {smallAlpha ? <GreenIndicator /> : <RedIndicator />}
                      At least 1 lowercase letter.
                    </div>
                    <div
                      className={
                        number
                          ? 'green-text flex items-center p-0.5'
                          : 'text-destructive flex items-center p-0.5'
                      }
                    >
                      {number ? <GreenIndicator /> : <RedIndicator />}
                      At least 1 numeric character.
                    </div>
                    <div
                      className={
                        splChar
                          ? 'green-text flex items-center p-0.5'
                          : 'text-destructive flex items-center p-0.5'
                      }
                    >
                      {splChar ? <GreenIndicator /> : <RedIndicator />}
                      At least 1 special character.
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {matchedValue && (
                  <div className="text-red-700">
                    {matchedValue.length > 1
                      ? 'Following characters are not allowed: '
                      : 'Following character is not allowed: '}
                    <br />
                    <strong>
                      {matchedValue
                        .filter((c, index) => matchedValue.indexOf(c) === index)
                        .join(' ')}
                    </strong>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <label>{''}</label>
        )}
      </div>
    </div>
  )
}

export default PasswordSuggestionBox
