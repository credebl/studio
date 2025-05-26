'use client'

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
      <div className="absolute z-10 flex justify-end rounded-sm bg-white px-6 py-4 text-xs shadow-lg shadow-gray-500/50">
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
                          ? 'flex items-center p-0.5 text-green-500'
                          : 'flex items-center p-0.5 text-red-500'
                      }
                    >
                      {minChar ? (
                        <svg
                          className={
                            'mr-2 h-4 w-4 text-green-500 dark:text-white'
                          }
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="mr-2 h-4 w-4 text-red-500 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m13 7-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      )}
                      Minimum of 8 characters.
                    </div>
                    <div
                      className={
                        capsAlpha
                          ? 'flex items-center p-0.5 text-green-500'
                          : 'flex items-center p-0.5 text-red-500'
                      }
                    >
                      {capsAlpha ? (
                        <svg
                          className={
                            'mr-2 h-4 w-4 text-green-500 dark:text-white'
                          }
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="mr-2 h-4 w-4 text-red-500 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m13 7-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      )}
                      At least 1 uppercase letter.
                    </div>
                    <div
                      className={
                        smallAlpha
                          ? 'flex items-center p-0.5 text-green-500'
                          : 'flex items-center p-0.5 text-red-500'
                      }
                    >
                      {smallAlpha ? (
                        <svg
                          className="mr-2 h-4 w-4 text-green-500 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="mr-2 h-4 w-4 text-red-500 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m13 7-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      )}
                      At least 1 lowercase letter.
                    </div>
                    <div
                      className={
                        number
                          ? 'flex items-center p-0.5 text-green-500'
                          : 'flex items-center p-0.5 text-red-500'
                      }
                    >
                      {number ? (
                        <svg
                          className={
                            'mr-2 h-4 w-4 text-green-500 dark:text-white'
                          }
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="mr-2 h-4 w-4 text-red-500 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m13 7-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      )}
                      At least 1 numeric character.
                    </div>
                    <div
                      className={
                        splChar
                          ? 'flex items-center p-0.5 text-green-500'
                          : 'flex items-center p-0.5 text-red-500'
                      }
                    >
                      {splChar ? (
                        <svg
                          className="mr-2 h-4 w-4 text-green-500 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="mr-2 h-4 w-4 text-red-500 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m13 7-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      )}
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
