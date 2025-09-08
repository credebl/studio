import { Field, FormikProps } from 'formik'
import React, { JSX } from 'react'

import { IFormData } from '../type/schemas-interface'

interface SchemaVersionProps {
  readonly formikHandlers: FormikProps<IFormData>
}

function SchemaVersion({ formikHandlers }: SchemaVersionProps): JSX.Element {
  return (
    <div
      className="flex-col sm:w-full md:flex md:w-96"
      style={{ marginLeft: 0 }}
    >
      <div>
        <label
          htmlFor="schemaVersion"
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Version<span className="text-destructive">*</span>
        </label>
      </div>

      <div className="flex-col md:flex">
        <Field
          id="schemaVersion"
          name="schemaVersion"
          placeholder="eg. 0.1 or 0.0.1"
          className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
        {formikHandlers.touched.schemaVersion &&
        formikHandlers.errors.schemaVersion ? (
          <label
            htmlFor="schemaVersion"
            className="text-destructive h-5 text-xs"
          >
            {formikHandlers.errors.schemaVersion}
          </label>
        ) : (
          <span aria-hidden="true" className="text-destructive h-5 text-xs">
            &nbsp;
          </span>
        )}
      </div>
    </div>
  )
}

export default SchemaVersion
