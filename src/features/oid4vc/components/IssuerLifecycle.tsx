'use client'

import { AlertState, ConfirmState } from './types'
import {
  ICredentialOffer,
  IIssuerListItem,
  ITemplate,
} from '@/app/oid4vc/interface/interface'
import { JSX, useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  asArray,
  getErrorMessage,
  getIssuerName,
  isSuccessStatus,
} from '@/features/oid4vc/utils/lifecycle'
import {
  deleteCredentialOffer,
  deleteIssuer,
  deleteTemplate,
  getCredentialOffers,
  getIssuers,
  getTemplates,
  reissueCredentialOffer,
  revokeCredential,
  updateCredentialOffer,
} from '@/app/api/oid4vc'

import { AlertComponent } from '@/components/AlertComponent'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ConfirmDialog from './ConfirmDialog'
import IssuerFormDialog from './IssuerFormDialog'
import IssuerPicker from './IssuerPicker'
import IssuerSummaryCard from './IssuerSummaryCard'
import Loader from '@/components/Loader'
import OfferDetailsDialog from './OfferDetailsDialog'
import OfferFormDialog from './OfferFormDialog'
import OffersPanel from './OffersPanel'
import TemplateFormDialog from './TemplateFormDialog'
import TemplatesPanel from './TemplatesPanel'
import { useAppSelector } from '@/lib/hooks'

export default function IssuerLifecycle(): JSX.Element {
  const orgId = useAppSelector((state) => state.organization.orgId)
  const orgName = useAppSelector((state) => state.organization.orgInfo?.name)

  const [issuers, setIssuers] = useState<IIssuerListItem[]>([])
  const [selectedIssuerId, setSelectedIssuerId] = useState('')
  const [templates, setTemplates] = useState<ITemplate[]>([])
  const [offers, setOffers] = useState<ICredentialOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [alert, setAlert] = useState<AlertState | null>(null)

  const [issuerDialogOpen, setIssuerDialogOpen] = useState(false)
  const [editingIssuer, setEditingIssuer] = useState<
    IIssuerListItem | undefined
  >()
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<
    ITemplate | undefined
  >()
  const [offerDialogOpen, setOfferDialogOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<ICredentialOffer>()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)

  const selectedIssuer = useMemo(
    () => issuers.find((issuer) => issuer.id === selectedIssuerId),
    [issuers, selectedIssuerId],
  )

  useEffect(() => {
    if (!alert) {
      return
    }

    const timer = setTimeout(() => setAlert(null), 5000)
    return () => clearTimeout(timer)
  }, [alert])

  const loadIssuers = useCallback(
    async (preferredId?: string): Promise<void> => {
      if (!orgId) {
        setLoading(false)
        return
      }

      try {
        setListLoading(true)
        const response = await getIssuers(orgId)
        const list = asArray<IIssuerListItem>(response.data?.data)
        setIssuers(list)
        setSelectedIssuerId((previous) => {
          if (preferredId && list.some((issuer) => issuer.id === preferredId)) {
            return preferredId
          }
          if (previous && list.some((issuer) => issuer.id === previous)) {
            return previous
          }
          return list[0]?.id ?? ''
        })
      } catch (caught) {
        setAlert({
          message: getErrorMessage(caught, 'Failed to load OID4VC issuers'),
          type: 'failure',
        })
      } finally {
        setListLoading(false)
        setLoading(false)
      }
    },
    [orgId],
  )

  useEffect(() => {
    void loadIssuers()
  }, [loadIssuers])

  const loadIssuerChildren = useCallback(
    async (issuer: IIssuerListItem): Promise<void> => {
      if (!orgId) {
        return
      }

      try {
        setListLoading(true)
        const [templateResponse, offerResponse] = await Promise.all([
          getTemplates(orgId, issuer.id),
          getCredentialOffers(orgId, issuer.publicIssuerId),
        ])
        setTemplates(asArray<ITemplate>(templateResponse.data?.data))
        setOffers(asArray<ICredentialOffer>(offerResponse.data?.data))
      } catch (caught) {
        setAlert({
          message: getErrorMessage(
            caught,
            'Failed to load templates and credential offers',
          ),
          type: 'failure',
        })
      } finally {
        setListLoading(false)
      }
    },
    [orgId],
  )

  useEffect(() => {
    if (!selectedIssuer) {
      setTemplates([])
      setOffers([])
      return
    }

    void loadIssuerChildren(selectedIssuer)
  }, [loadIssuerChildren, selectedIssuer])

  const openCreateIssuer = (): void => {
    setEditingIssuer(undefined)
    setIssuerDialogOpen(true)
  }

  const openEditIssuer = (issuer: IIssuerListItem): void => {
    setEditingIssuer(issuer)
    setIssuerDialogOpen(true)
  }

  const handleIssuerSaved = async (
    issuerId: string,
    message: string,
  ): Promise<void> => {
    setIssuerDialogOpen(false)
    setAlert({ message, type: 'success' })
    await loadIssuers(issuerId)
  }

  const requestDeleteIssuer = (issuer: IIssuerListItem): void => {
    setConfirm({
      title: 'Delete issuer',
      description: `Delete ${getIssuerName(issuer)} and its templates? This cannot be undone.`,
      confirmLabel: 'Delete issuer',
      destructive: true,
      action: async () => {
        if (!orgId) {
          return
        }
        await deleteIssuer(orgId, issuer.id)
        setAlert({ message: 'Issuer deleted', type: 'success' })
        await loadIssuers()
      },
    })
  }

  const handleTemplateSaved = async (
    _templateId: string,
    message: string,
  ): Promise<void> => {
    setTemplateDialogOpen(false)
    setAlert({ message, type: 'success' })
    if (selectedIssuer) {
      await loadIssuerChildren(selectedIssuer)
    }
  }

  const requestDeleteTemplate = (template: ITemplate): void => {
    if (!selectedIssuer) {
      return
    }
    const issuer = selectedIssuer

    setConfirm({
      title: 'Delete template',
      description: `Delete the credential template "${template.name}"? Existing offers are not affected.`,
      confirmLabel: 'Delete template',
      destructive: true,
      action: async () => {
        if (!orgId) {
          return
        }
        await deleteTemplate(orgId, issuer.id, template.id)
        setAlert({ message: 'Template deleted', type: 'success' })
        await loadIssuerChildren(issuer)
      },
    })
  }

  const handleOfferSaved = async (
    message: string,
    credentialOfferUri?: string,
  ): Promise<void> => {
    setOfferDialogOpen(false)
    setAlert({
      message: credentialOfferUri
        ? `${message} — ${credentialOfferUri}`
        : message,
      type: 'success',
    })
    if (selectedIssuer) {
      await loadIssuerChildren(selectedIssuer)
    }
  }

  const requestReissue = (offer: ICredentialOffer): void => {
    if (!selectedIssuer) {
      return
    }
    const issuer = selectedIssuer

    setConfirm({
      title: 'Reissue credential offer',
      description: 'Create a fresh offer for the same credential details?',
      confirmLabel: 'Reissue',
      action: async () => {
        if (!orgId) {
          return
        }
        const response = await reissueCredentialOffer(orgId, offer.id)
        if (!isSuccessStatus(response.status, [200, 201, 202])) {
          throw new Error(
            response.data?.message ?? 'Failed to reissue credential offer',
          )
        }
        setAlert({ message: 'Credential offer reissued', type: 'success' })
        await loadIssuerChildren(issuer)
      },
    })
  }

  const requestRevoke = (offer: ICredentialOffer): void => {
    if (!selectedIssuer) {
      return
    }
    const issuer = selectedIssuer

    setConfirm({
      title: 'Revoke issued credentials',
      description:
        'Revoke all credentials issued in this offer session? Wallets will report them as revoked.',
      confirmLabel: 'Revoke credentials',
      destructive: true,
      action: async () => {
        if (!orgId) {
          return
        }
        const response = await revokeCredential(orgId, offer.id)
        if (!isSuccessStatus(response.status, [200, 201])) {
          throw new Error(
            response.data?.message ?? 'Failed to revoke credentials',
          )
        }
        setAlert({ message: 'Credentials revoked', type: 'success' })
        setDetailsOpen(false)
        await loadIssuerChildren(issuer)
      },
    })
  }

  const requestDeleteOffer = (offer: ICredentialOffer): void => {
    if (!selectedIssuer) {
      return
    }
    const issuer = selectedIssuer

    setConfirm({
      title: 'Delete credential offer',
      description: 'Remove this credential offer from the issuer?',
      confirmLabel: 'Delete offer',
      destructive: true,
      action: async () => {
        if (!orgId) {
          return
        }
        await deleteCredentialOffer(orgId, offer.id)
        setAlert({ message: 'Credential offer deleted', type: 'success' })
        setDetailsOpen(false)
        await loadIssuerChildren(issuer)
      },
    })
  }

  const handleUpdateOfferMetadata = async (
    offer: ICredentialOffer,
    issuerMetadata: Record<string, unknown>,
  ): Promise<void> => {
    if (!orgId || !selectedIssuer) {
      throw new Error('No organization or issuer selected')
    }

    const response = await updateCredentialOffer(
      orgId,
      selectedIssuer.id,
      offer.id,
      { issuerMetadata },
    )
    if (!isSuccessStatus(response.status, [200, 201])) {
      throw new Error(
        response.data?.message ?? 'Failed to update credential offer',
      )
    }

    setAlert({ message: 'Offer metadata updated', type: 'success' })
    await loadIssuerChildren(selectedIssuer)
  }

  const handleConfirm = async (): Promise<void> => {
    if (!confirm) {
      return
    }

    try {
      setBusy(true)
      await confirm.action()
      setConfirm(null)
    } catch (caught) {
      setAlert({
        message: getErrorMessage(caught, 'Action failed'),
        type: 'failure',
      })
      setConfirm(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="animate-fade-in-up mx-8 space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OID4VC Issuers</h2>
          <p className="text-muted-foreground">
            Manage issuers, credential templates, and credential offers.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={listLoading}
            onClick={() => void loadIssuers()}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button type="button" className="gap-1.5" onClick={openCreateIssuer}>
            <Plus className="h-4 w-4" />
            Create issuer
          </Button>
        </div>
      </div>

      {alert && (
        <AlertComponent
          message={alert.message}
          type={alert.type}
          onAlertClose={() => setAlert(null)}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size={28} />
        </div>
      ) : issuers.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-lg font-medium">No OID4VC issuers yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Create your first issuer to start issuing credentials.
          </p>
          <Button
            type="button"
            className="mt-5 gap-1.5"
            onClick={openCreateIssuer}
          >
            <Plus className="h-4 w-4" />
            Create issuer
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <IssuerPicker
            issuers={issuers}
            selectedIssuerId={selectedIssuerId}
            onSelect={setSelectedIssuerId}
          />

          {selectedIssuer && (
            <div className="space-y-5">
              <IssuerSummaryCard
                issuer={selectedIssuer}
                onEdit={openEditIssuer}
                onDelete={requestDeleteIssuer}
              />

              <Tabs defaultValue="templates">
                <TabsList>
                  <TabsTrigger value="templates">
                    Templates ({templates.length})
                  </TabsTrigger>
                  <TabsTrigger value="offers">
                    Credential offers ({offers.length})
                  </TabsTrigger>
                </TabsList>

                <TemplatesPanel
                  loading={listLoading}
                  templates={templates}
                  onNew={() => {
                    setEditingTemplate(undefined)
                    setTemplateDialogOpen(true)
                  }}
                  onEdit={(template) => {
                    setEditingTemplate(template)
                    setTemplateDialogOpen(true)
                  }}
                  onDelete={requestDeleteTemplate}
                />

                <OffersPanel
                  loading={listLoading}
                  hasTemplates={templates.length > 0}
                  offers={offers}
                  onNew={() => setOfferDialogOpen(true)}
                  onView={(offer) => {
                    setSelectedOffer(offer)
                    setDetailsOpen(true)
                  }}
                />
              </Tabs>
            </div>
          )}
        </div>
      )}

      <IssuerFormDialog
        open={issuerDialogOpen}
        orgId={orgId ?? ''}
        orgName={orgName}
        issuer={editingIssuer}
        onClose={() => setIssuerDialogOpen(false)}
        onSaved={(issuerId, message) =>
          void handleIssuerSaved(issuerId, message)
        }
      />

      {selectedIssuer && (
        <>
          <TemplateFormDialog
            open={templateDialogOpen}
            orgId={orgId ?? ''}
            issuerId={selectedIssuer.id}
            template={editingTemplate}
            onClose={() => setTemplateDialogOpen(false)}
            onSaved={(templateId, message) =>
              void handleTemplateSaved(templateId, message)
            }
          />

          <OfferFormDialog
            open={offerDialogOpen}
            orgId={orgId ?? ''}
            issuerId={selectedIssuer.id}
            templates={templates}
            onClose={() => setOfferDialogOpen(false)}
            onSaved={(message, credentialOfferUri) =>
              void handleOfferSaved(message, credentialOfferUri)
            }
          />

          <OfferDetailsDialog
            open={detailsOpen}
            offer={selectedOffer}
            busy={busy}
            onClose={() => setDetailsOpen(false)}
            onReissue={requestReissue}
            onRevoke={requestRevoke}
            onDelete={requestDeleteOffer}
            onUpdateMetadata={handleUpdateOfferMetadata}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title ?? ''}
        description={confirm?.description ?? ''}
        confirmLabel={confirm?.confirmLabel}
        destructive={confirm?.destructive}
        busy={busy}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
