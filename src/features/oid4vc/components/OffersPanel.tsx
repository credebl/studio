import { Eye, Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { AlertComponent } from '@/components/AlertComponent'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ICredentialOffer } from '@/app/oid4vc/interface/interface'
import { JSX } from 'react'
import Loader from '@/components/Loader'
import { TabsContent } from '@/components/ui/tabs'
import { formatDate } from '@/features/oid4vc/utils/lifecycle'

interface OffersPanelProps {
  loading: boolean
  hasTemplates: boolean
  offers: ICredentialOffer[]
  onNew: () => void
  onView: (offer: ICredentialOffer) => void
}

export default function OffersPanel({
  loading,
  hasTemplates,
  offers,
  onNew,
  onView,
}: OffersPanelProps): JSX.Element {
  return (
    <TabsContent value="offers" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">Credential offers</h4>
          <p className="text-muted-foreground text-sm">
            Issue, reissue, revoke, and manage credential offers.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          disabled={!hasTemplates}
          onClick={onNew}
        >
          <Plus className="h-3.5 w-3.5" />
          New offer
        </Button>
      </div>

      {!hasTemplates && (
        <AlertComponent
          message="Create a credential template before issuing an offer."
          type="warning"
          onAlertClose={() => undefined}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader size={22} />
        </div>
      ) : offers.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No credential offers yet.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offer</TableHead>
                <TableHead>Credential type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => {
                const configurationIds = offer.credentialOfferPayload
                  ?.credential_configuration_ids as string[] | undefined
                return (
                  <TableRow key={offer.id}>
                    <TableCell className="max-w-[220px] truncate font-mono text-xs">
                      {offer.credentialOfferId ?? offer.id}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs">
                      {configurationIds?.join(', ') ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {offer.status?.label ?? offer.state ?? '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(offer.createdAt)}</TableCell>
                    <TableCell>{formatDate(offer.expiresAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => onView(offer)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </TabsContent>
  )
}
