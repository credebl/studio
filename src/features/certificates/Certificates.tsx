'use client'

import { Card, CardContent } from '@/components/ui/card'
import React, { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const Certificates = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'Issuer Root',
    keyType: 'P-256',
    countryName: 'NL',
    commonName: '',
    issuerAlternativeName: '',
  })

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const handleCancel = () => {
    setShowCreateForm(false)
    setFormData({
      type: 'Issuer Root',
      keyType: 'P-256',
      countryName: 'NL',
      commonName: '',
      issuerAlternativeName: '',
    })
  }

  // Empty State - No Certificates
  if (!showCreateForm) {
    return (
      <div className="mx-auto w-full max-w-6xl p-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Certificates</h1>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create New Certificate
          </Button>
        </div>

        <Card className="border shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted mb-4 rounded-full p-6">
              <FileText className="text-muted-foreground h-12 w-12" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">
              No certificates created
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md text-center">
              Get started by creating your first certificate. Click the button
              below to begin.
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create New Certificate
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Create Certificate Form
  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Create certificate</h1>
        <Button variant="outline" onClick={handleCancel}>
          Back to List
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Left Column - Labels and Descriptions */}
            <div className="space-y-12">
              <div>
                <h2 className="mb-2 text-base font-semibold">Type</h2>
                <p className="text-muted-foreground text-sm">
                  Choose the type of certificate you want to create.
                </p>
              </div>

              <div>
                <h2 className="mb-2 text-base font-semibold">Details</h2>
                <p className="text-muted-foreground text-sm">
                  The details of the root certificate. This information will be
                  used to generate the certificate.
                </p>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Issuer Root">Issuer Root</SelectItem>
                    <SelectItem value="Intermediate">Verifier Root</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyType">
                  Key Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.keyType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, keyType: value })
                  }
                >
                  <SelectTrigger id="keyType">
                    <SelectValue placeholder="Select key type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P-256">P-256</SelectItem>
                    <SelectItem value="P-384">Ed25519</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commonName">Common Name</Label>
                <Input
                  id="commonName"
                  placeholder="Name of the certificate issuer/subject"
                  value={formData.commonName}
                  onChange={(e) =>
                    setFormData({ ...formData, commonName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuerAlternativeName">
                  Issuer Alternative Name URL{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="issuerAlternativeName"
                  placeholder="The URL of the issuer"
                  value={formData.issuerAlternativeName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      issuerAlternativeName: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Create certificate
        </Button>
      </div>
    </div>
  )
}

export default Certificates
