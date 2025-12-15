'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Loader2, X } from 'lucide-react'
import {
  IColumnData,
  ITableMetadata,
  SortActions,
  TableStyling,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createCerificate,
  getAllx509Certificates,
  getx509Certificate,
} from '@/app/api/x509'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/generic-table-component/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PageContainer from '@/components/layout/page-container'
import { apiStatusCodes } from '@/config/CommonConstant'
import { useAppSelector } from '@/lib/hooks'
import SidePanelComponent from '@/config/SidePanelCommon'
import { dateConversion } from '@/utils/DateConversion'

interface Certificate {
  id: string
  commonName: string
  type: string
  keyType: string
  countryName: string
  issuerAlternativeName?: string
  createdAt?: string
}

interface CertificateDetails {
  id: string
  orgAgentId: string
  keyType: string
  status: string
  validFrom: string
  expiry: string
  certificateBase64: string
  isImported: boolean
  createdAt: string
  createdBy: string
  lastChangedDateTime: string
  lastChangedBy: string
}

const Certificates = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Sidepanel state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCertForSidepanel, setSelectedCertForSidepanel] =
    useState<CertificateDetails | null>(null)
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 1,
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as SortActions,
  })

  const [formData, setFormData] = useState({
    type: 'Issuer Root',
    keyType: 'P-256',
    countryName: 'NL',
    commonName: '',
    issuerAlternativeName: '',
    subjectAlternativeName: '',
  })
  const orgId = useAppSelector((state) => state?.organization.orgId)

  useEffect(() => {
    if (orgId) {
      fetchCertificates()
    }
  }, [orgId])

  const fetchCertificates = async () => {
    try {
      setLoading(true)

      const { pageIndex, pageSize, searchTerm, sortBy, sortOrder } =
        paginationState

      const response = await getAllx509Certificates(orgId || '', {
        page: pageIndex + 1,
        itemPerPage: pageSize,
        search: searchTerm,
        sortBy,
        sortingOrder: sortOrder,
      })

      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const raw = data?.data?.data || []
        setCertificates(raw)
        setPaginationState((prev) => ({
          ...prev,
          pageCount: data?.data?.lastPage ?? 1,
        }))
      }
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const openSidepanel = async (certificate: Certificate) => {
    try {
      // Fetch the detailed certificate information
      const response = await getx509Certificate(orgId || '', certificate.id)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setSelectedCertForSidepanel(data.data)
        setIsDrawerOpen(true)
      } else {
        console.error('Failed to fetch certificate details for sidepanel')
      }
    } catch (error) {
      console.error('Error fetching certificate details for sidepanel:', error)
    }
  }

  // Prepare fields for sidepanel
  const sidepanelFields = selectedCertForSidepanel
    ? [
        {
          label: 'Certificate ID',
          value: selectedCertForSidepanel.id,
        },
        {
          label: 'Common Name',
          value: selectedCertForSidepanel.id, // You might want to store commonName in CertificateDetails
        },
        {
          label: 'Key Type',
          value: selectedCertForSidepanel.keyType,
        },
        {
          label: 'Status',
          value: selectedCertForSidepanel.status,
        },
        {
          label: 'Valid From',
          value: dateConversion(selectedCertForSidepanel.validFrom),
        },
        {
          label: 'Expiry',
          value: dateConversion(selectedCertForSidepanel.expiry),
        },

        {
          label: 'Is Imported',
          value: selectedCertForSidepanel.isImported ? 'Yes' : 'No',
        },
      ]
    : []

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!formData.commonName?.trim()) {
      alert('Common Name is required')
      return
    }

    if (!formData.issuerAlternativeName?.trim()) {
      alert('Issuer Alternative Name URL is required')
      return
    }

    if (!formData.subjectAlternativeName?.trim()) {
      alert('Subject Alternative Name is required')
      return
    }

    setCreating(true)

    const keyType = formData.keyType === 'P-256' ? 'p256' : 'ed25519'
    const commonName = formData.commonName
    const now = new Date()
    const notBefore = new Date(now)
    const notAfter = new Date(now)
    notAfter.setFullYear(notAfter.getFullYear() + 1)

    const domain = formData.subjectAlternativeName.includes('.')
      ? formData.subjectAlternativeName
      : `${formData.subjectAlternativeName}.com`

    const email = `admin@${domain}`

    const payload = {
      authorityKey: {
        keyType: keyType,
      },
      issuer: {
        countryName: formData.countryName || 'NL',
        commonName: commonName,
      },
      validity: {
        notBefore: notBefore.toISOString(),
        notAfter: notAfter.toISOString(),
      },
      extensions: {
        keyUsage: {
          usages: [1, 4, 64],
          markAsCritical: true,
        },
        extendedKeyUsage: {
          usages: ['1.0.18013.5.1.2'],
          markAsCritical: true,
        },
        authorityKeyIdentifier: {
          include: true,
          markAsCritical: true,
        },
        subjectKeyIdentifier: {
          include: true,
          markAsCritical: true,
        },
        issuerAlternativeName: {
          name: [
            {
              type: 'dns',
              value: domain,
            },
            {
              type: 'url',
              value: formData.issuerAlternativeName,
            },
            {
              type: 'email',
              value: email,
            },
          ],
          markAsCritical: true,
        },
        subjectAlternativeName: {
          name: [
            {
              type: 'dns',
              value: domain,
            },
            {
              type: 'email',
              value: email,
            },
          ],
          markAsCritical: true,
        },
        basicConstraints: {
          ca: true,
          pathLenConstraint: 0,
          markAsCritical: true,
        },
      },
    }

    try {
      const response = await createCerificate(orgId || '', payload)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        alert('Certificate created successfully!')
        setShowCreateForm(false)
        handleCancel()
        await fetchCertificates()
      } else {
        alert(
          `Failed to create certificate: ${data?.message || 'Unknown error'}`,
        )
      }
    } catch (error: any) {
      console.error('❌ Error details:', error)
      alert(
        `Failed to create certificate: ${error?.response?.data?.message || error.message || 'Unknown error'}`,
      )
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = () => {
    setShowCreateForm(false)
    setFormData({
      type: 'Issuer Root',
      keyType: 'P-256',
      countryName: 'NL',
      commonName: '',
      issuerAlternativeName: '',
      subjectAlternativeName: '',
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <span className="text-muted-foreground ml-2">
          Loading certificates...
        </span>
      </div>
    )
  }

  if (!showCreateForm && certificates.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Certificates</h2>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create New Certificate
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">
              No certificates created
            </h3>
            <p className="text-muted-foreground mb-6 text-center">
              Get started by creating your first certificate. Click the button
              below to begin.
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create New Certificate
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!showCreateForm && certificates.length > 0) {
    const statusCell = ({ row }: { row: { original: CertificateDetails } }) => {
      const status = row.original.status

      return (
        <span
          className={`rounded px-2 py-1 text-xs ${
            status === 'Active'
              ? 'bg-green-100 text-green-800'
              : status === 'Inactive'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {status}
        </span>
      )
    }

    const dateCell = ({ row, column }: any) => {
      return <span>{new Date(row.original[column.id]).toLocaleString()}</span>
    }

    const actionCell = ({ row }: any) => {
      const cert = row.original

      return (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => console.log('activate', cert.id)}
          >
            Active
          </Button>

          <Button
            variant="destructive"
            onClick={() => console.log('deactivate', cert.id)}
          >
            Deactive
          </Button>

          <Button variant="outline" onClick={() => openSidepanel(cert)}>
            View
          </Button>
        </div>
      )
    }

    const columnData: IColumnData[] = [
      {
        id: 'keyType',
        title: 'Key Type',
        accessorKey: 'keyType',
        columnFunction: [],
      },
      {
        id: 'validFrom',
        title: 'valid From',
        accessorKey: 'validFrom',
        columnFunction: [],
      },
      {
        id: 'expiry',
        title: 'Expiry',
        accessorKey: 'expiry',
        columnFunction: [],
      },

      {
        id: 'actions',
        title: '',
        accessorKey: 'actions',
        cell: actionCell,
        columnFunction: [],
      },
    ]

    const metadata: ITableMetadata = { enableSelection: false }

    const tableStyling: TableStyling = { metadata, columnData }
    const columns = getColumns<Certificate>(tableStyling)

    return (
      <PageContainer>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Certificates</h2>
          <Button onClick={() => setShowCreateForm(true)}>
            Create New Certificate
          </Button>
        </div>

        <DataTable
          isLoading={loading}
          placeHolder="Search certificates"
          data={certificates}
          columns={columns}
          index="id"
          pageIndex={paginationState.pageIndex}
          pageSize={paginationState.pageSize}
          pageCount={paginationState.pageCount}
          onPageChange={(index: any) =>
            setPaginationState((prev) => ({ ...prev, pageIndex: index }))
          }
          onPageSizeChange={(size: any) =>
            setPaginationState((prev) => ({
              ...prev,
              pageSize: size,
              pageIndex: 0,
            }))
          }
          onSearchTerm={(term: any) =>
            setPaginationState((prev) => ({
              ...prev,
              searchTerm: term,
              pageIndex: 0,
            }))
          }
        />

        {/* Certificate Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Certificate Details</DialogTitle>
            </DialogHeader>

            {loadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                <span className="text-muted-foreground ml-2">
                  Loading details...
                </span>
              </div>
            ) : selectedCertificate ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Certificate ID
                    </Label>
                    <p className="font-mono text-sm break-all">
                      {selectedCertificate.id}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Org Agent ID
                    </Label>
                    <p className="font-mono text-sm break-all">
                      {selectedCertificate.orgAgentId}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Key Type
                    </Label>
                    <p className="text-sm">{selectedCertificate.keyType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Status
                    </Label>
                    <p className="text-sm">
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs ${
                          selectedCertificate.status === 'Pending activation'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {selectedCertificate.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Valid From
                    </Label>
                    <p className="text-sm">
                      {new Date(selectedCertificate.validFrom).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Expiry
                    </Label>
                    <p className="text-sm">
                      {new Date(selectedCertificate.expiry).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Created At
                    </Label>
                    <p className="text-sm">
                      {new Date(selectedCertificate.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Last Changed
                    </Label>
                    <p className="text-sm">
                      {new Date(
                        selectedCertificate.lastChangedDateTime,
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Is Imported
                    </Label>
                    <p className="text-sm">
                      {selectedCertificate.isImported ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Created By
                    </Label>
                    <p className="font-mono text-sm text-xs break-all">
                      {selectedCertificate.createdBy}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-muted-foreground text-xs">
                    Certificate (Base64)
                  </Label>
                  <div className="bg-muted mt-1 max-h-40 overflow-y-auto rounded border p-3">
                    <code className="font-mono text-xs break-all">
                      {selectedCertificate.certificateBase64}
                    </code>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsDialog(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
        <SidePanelComponent
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          fields={sidepanelFields}
        />
      </PageContainer>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Create certificate</h2>
          <Button variant="outline" onClick={handleCancel}>
            Back to List
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-8">
              <div>
                <h3 className="mb-2 font-semibold">Type</h3>
                <p className="text-muted-foreground text-sm">
                  Choose the type of certificate you want to create.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Details</h3>
                <p className="text-muted-foreground text-sm">
                  The details of the root certificate. This information will be
                  used to generate the certificate.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="type">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Issuer Root">Issuer Root</SelectItem>
                    <SelectItem value="Verifier Root">Verifier Root</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="keyType">
                  Key Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.keyType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, keyType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select key type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P-256">P-256</SelectItem>
                    <SelectItem value="Ed25519">Ed25519</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="commonName">Common Name</Label>
                <Input
                  id="commonName"
                  value={formData.commonName}
                  onChange={(e) =>
                    setFormData({ ...formData, commonName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="issuerAlternativeName">
                  Issuer Alternative Name URL{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="issuerAlternativeName"
                  value={formData.issuerAlternativeName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      issuerAlternativeName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="subjectAlternativeName">
                  Subject Alternative Name (DNS){' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subjectAlternativeName"
                  value={formData.subjectAlternativeName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subjectAlternativeName: e.target.value,
                    })
                  }
                  placeholder="example.com"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create certificate'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default Certificates
