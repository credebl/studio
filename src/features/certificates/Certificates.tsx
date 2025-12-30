'use client'

import { Card, CardContent } from '@/components/ui/card'
import React, { JSX, useCallback, useEffect, useState } from 'react'
import { RefreshCw, Upload } from 'lucide-react'
import {
  apiStatusCodes,
  itemPerPage,
  pageCount,
  pageIndex,
  sortBy,
  sortOrder,
} from '@/config/CommonConstant'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import CertificateList from './CertificateList'
import CreateCertificate from './CreateCertificate'
import { Features } from '@/common/enums'
import ImportCertificateDialog from './ImportCertificateDialog'
import Loader from '@/components/Loader'
import PageContainer from '@/components/layout/page-container'
import { PaginationState } from '@/common/interface'
import RoleViewButton from '@/components/RoleViewButton'
import { certificateSvgComponent } from '@/config/certificateSvgComponent'
import { getAllx509Certificates } from '@/app/api/x509'
import { useAppSelector } from '@/lib/hooks'

interface Certificate {
  id: string
  commonName: string
  type: string
  keyType: string
  countryName: string
  issuerAlternativeName?: string
  createdAt?: string
  status?: string
  validFrom?: string
  expiry?: string
}

const Certificates = (): JSX.Element => {
  const [view, setView] = useState<'list' | 'create'>('list')
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false)
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex,
    pageSize: itemPerPage,
    pageCount,
    searchTerm: '',
    sortBy,
    sortOrder,
  })

  const orgId = useAppSelector((state) => state?.organization.orgId)

  useEffect(() => {
    setSuccess(null)
    setFailure(null)
  }, [view])

  const fetchCertificates = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)

      const response = await getAllx509Certificates(orgId || '')

      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const raw = data?.data?.data || []
        setCertificates(raw)
        setPaginationState((prev) => ({
          ...prev,
          pageCount: data?.data?.lastPage ?? 1,
        }))
      } else {
        setFailure(data?.message || 'Failed to fetch certificates')
      }
    } catch (error: unknown) {
      const apiError = error as {
        response?: { data?: { message?: string } }
      }
      setFailure(
        apiError?.response?.data?.message || 'Failed to fetch certificates',
      )
    } finally {
      setLoading(false)
    }
  }, [
    orgId,
    paginationState.searchTerm,
    paginationState.sortBy,
    paginationState.sortOrder,
  ])

  useEffect(() => {
    if (orgId && view === 'list') {
      fetchCertificates()
    }
  }, [
    orgId,
    view,
    paginationState.pageIndex,
    paginationState.pageSize,
    fetchCertificates,
  ])

  const handleRefresh = (): void => {
    fetchCertificates()
  }

  const handleCreateSuccess = (message: string): void => {
    setSuccess(message)
    setView('list')
    setTimeout(() => fetchCertificates(), 500)
  }

  const handleCreateFailure = (message: string): void => {
    setFailure(message)
  }

  const handleImportSuccess = (message: string): void => {
    setSuccess(message)
    setShowImportDialog(false)
    setTimeout(() => fetchCertificates(), 500)
  }

  const handleImportFailure = (message: string): void => {
    setFailure(message)
  }

  const renderAlerts = (): JSX.Element => (
    <>
      {success && (
        <div
          className="animate-in fade-in slide-in-from-top-2 mb-4 w-full duration-300"
          role="alert"
        >
          <AlertComponent
            message={success}
            type="success"
            onAlertClose={() => setSuccess(null)}
          />
        </div>
      )}
      {failure && (
        <div
          className="animate-in fade-in slide-in-from-top-2 mb-4 w-full duration-300"
          role="alert"
        >
          <AlertComponent
            message={failure}
            type="failure"
            onAlertClose={() => setFailure(null)}
          />
        </div>
      )}
    </>
  )

  if (loading && view === 'list' && certificates.length === 0) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="relative">
            <Loader size={40} />
          </div>
          <div>
            <p className="text-lg font-medium">Loading certificates</p>
            <p className="text-muted-foreground text-sm">
              Please wait while we fetch your data
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = (): JSX.Element => {
    if (view === 'create') {
      return (
        <CreateCertificate
          onCancel={() => setView('list')}
          onSuccess={handleCreateSuccess}
          onFailure={handleCreateFailure}
        />
      )
    }

    if (certificates.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            {renderAlerts()}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Certificates
                </h2>
                <p className="text-muted-foreground mt-1">
                  Manage your X.509 certificates
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowImportDialog(true)}
                >
                  <Upload className="h-4 w-4" /> Import Certificate
                </Button>

                <RoleViewButton
                  buttonTitle="Create Certificate"
                  feature={Features.CREATE_CERTIFICATE}
                  svgComponent={certificateSvgComponent()}
                  onClickEvent={() => setView('create')}
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center px-4 py-16">
              <h3 className="mb-3 text-2xl font-semibold">
                No certificates yet
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md text-center">
                Get started by creating or importing a certificate.
              </p>
              <div className="flex gap-3">
                <RoleViewButton
                  buttonTitle="Create Certificate"
                  feature={Features.CREATE_CERTIFICATE}
                  svgComponent={certificateSvgComponent()}
                  onClickEvent={() => setView('create')}
                />
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowImportDialog(true)}
                >
                  <Upload className="h-5 w-5" />
                  Import Certificate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <>
        {renderAlerts()}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Certificates</h2>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your X.509 certificates
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="h-4 w-4" /> Import Certificate
            </Button>
            <RoleViewButton
              buttonTitle="Create Certificate"
              feature={Features.CREATE_CERTIFICATE}
              svgComponent={certificateSvgComponent()}
              onClickEvent={() => setView('create')}
            />
          </div>
        </div>

        <CertificateList
          certificates={certificates}
          loading={loading}
          paginationState={paginationState}
          onPaginationChange={setPaginationState}
          onRefresh={fetchCertificates}
          onSuccess={(msg: string | null) => {
            setSuccess(msg)
            setFailure(null)
          }}
          onFailure={(msg: string | null) => {
            setFailure(msg)
            setSuccess(null)
          }}
        />
      </>
    )
  }

  return (
    <PageContainer>
      <ImportCertificateDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onSuccess={handleImportSuccess}
        onFailure={handleImportFailure}
        orgId={orgId || ''}
      />

      {renderContent()}
    </PageContainer>
  )
}

export default Certificates
