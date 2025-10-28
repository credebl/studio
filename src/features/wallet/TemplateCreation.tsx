'use client'

import * as yup from 'yup'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, FileText, Info, Shield } from 'lucide-react'
import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Formik } from 'formik'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface IValuesShared {
  name: string
  description: string
  format: string
  issuer: string
  canBeRevoked: boolean
}

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string(),
  format: yup.string().required('Format is required'),
  issuer: yup.string().required('Issuer is required'),
  canBeRevoked: yup.boolean(),
})

const TemplateCreation = (): React.JSX.Element => {
  const initialValues: IValuesShared = {
    name: 'Paradym Member',
    description: 'Proof of membership of the Paradym Community',
    format: 'sd-jwt-vc',
    issuer: 'did:web',
    canBeRevoked: false,
  }

  const handleSubmit = (values: IValuesShared) => {
    console.log('Form values:', values)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, handleChange, handleBlur }) => (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">General</CardTitle>
                <CardDescription>
                  Specify your credential. Different formats support different capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Name <span className="text-red-500">*</span>
                    <Info className="w-4 h-4 text-gray-400" />
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Paradym Member"
                    className="w-full"
                  />
                  {errors.name && touched.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    Description
                    <Info className="w-4 h-4 text-gray-400" />
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Proof of membership of the Paradym Community"
                    className="w-full resize-none"
                    rows={2}
                  />
                </div>

                {/* Format Selection */}
                <div className="space-y-3">
                  <Label>Format</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Simple Selective Disclosure */}
                    <button
                      type="button"
                      onClick={() => setFieldValue('format', 'sd-jwt-vc')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        values.format === 'sd-jwt-vc'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-blue-100">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">Simple Selective Disclosure</span>
                            <span className="text-xs text-gray-500">sd-jwt-vc</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Works with OpenID4VC issuance and verification.
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Mobile Document */}
                    <button
                      type="button"
                      onClick={() => setFieldValue('format', 'mdoc')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        values.format === 'mdoc'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-blue-100">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">Mobile Document</span>
                            <span className="text-xs text-gray-500">mdoc</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Works with OpenID4VC issuance and verification.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Anonymous credentials */}
                  <button
                    type="button"
                    onClick={() => setFieldValue('format', 'anoncreds')}
                    className={`w-full md:w-1/2 p-4 rounded-lg border-2 text-left transition-all ${
                      values.format === 'anoncreds'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded bg-blue-100">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Anonymous credentials</span>
                          <span className="text-xs text-gray-500">anoncreds</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Works with DIDComm issuance and verification.
                        </p>
                      </div>
                    </div>
                  </button>

                  <a
                    href="#"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    Learn more about selecting the right format →
                  </a>
                </div>

                {/* Issuer Field */}
                <div className="space-y-2">
                  <Label htmlFor="issuer" className="flex items-center gap-2">
                    Issuer
                    <Info className="w-4 h-4 text-gray-400" />
                  </Label>
                  <Select
                    value={values.issuer}
                    onValueChange={(value) => setFieldValue('issuer', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select issuer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="did:web">did:web</SelectItem>
                      <SelectItem value="did:key">did:key</SelectItem>
                      <SelectItem value="did:ion">did:ion</SelectItem>
                    </SelectContent>
                  </Select>

                  <a
                    href="#"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    Create X.509 root certificates →
                  </a>
                </div>

                {/* Can be revoked */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canBeRevoked"
                    checked={values.canBeRevoked}
                    onCheckedChange={(checked) => setFieldValue('canBeRevoked', checked)}
                  />
                  <Label
                    htmlFor="canBeRevoked"
                    className="flex items-center gap-2 text-sm font-normal cursor-pointer"
                  >
                    Can be revoked
                    <Info className="w-4 h-4 text-gray-400" />
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Formik>
    </div>
  )
}

export default TemplateCreation