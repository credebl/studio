import React, { JSX } from 'react'

function Steps(): JSX.Element {
  return (
    <>
      <p className="m-6 text-lg dark:text-white">Steps</p>
      <ul className="timelinestatic m-6">
        <li>
          <p className="steps-active-text text-lg text-gray-600 dark:text-white">
            Select and Download
          </p>
          <p className="text-sm text-gray-500 dark:text-white">
            Select credential definition and download .CSV file
          </p>
        </li>
        <li>
          <p className="steps-active-text text-lg text-gray-600 dark:text-white">
            Fill the data
          </p>
          <p className="text-sm text-gray-500 dark:text-white">
            Fill issuance data in the downloaded .CSV file
          </p>
        </li>
        <li>
          <p className="steps-active-text text-lg text-gray-600 dark:text-white">
            Upload and Issue
          </p>
          <p className="text-sm text-gray-500 dark:text-white">
            Upload .CSV file and click on issue
          </p>
        </li>
      </ul>
    </>
  )
}

export default Steps
