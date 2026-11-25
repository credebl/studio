import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ITemplate } from '@/app/oid4vc/interface/interface'
import { JSX } from 'react'
import Loader from '@/components/Loader'
import { TabsContent } from '@/components/ui/tabs'
import { formatDate } from '@/features/oid4vc/utils/lifecycle'

interface TemplatesPanelProps {
  loading: boolean
  templates: ITemplate[]
  onNew: () => void
  onEdit: (template: ITemplate) => void
  onDelete: (template: ITemplate) => void
}

export default function TemplatesPanel({
  loading,
  templates,
  onNew,
  onEdit,
  onDelete,
}: TemplatesPanelProps): JSX.Element {
  return (
    <TabsContent value="templates" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">Credential templates</h4>
          <p className="text-muted-foreground text-sm">
            Define the credentials this issuer can offer.
          </p>
        </div>
        <Button type="button" size="sm" className="gap-1.5" onClick={onNew}>
          <Plus className="h-3.5 w-3.5" />
          New template
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader size={22} />
        </div>
      ) : templates.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No credential templates yet.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Signer</TableHead>
                <TableHead>Revocable</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.format}</TableCell>
                  <TableCell>{template.signerOption ?? '—'}</TableCell>
                  <TableCell>{template.canBeRevoked ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{formatDate(template.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${template.name}`}
                        onClick={() => onEdit(template)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        aria-label={`Delete ${template.name}`}
                        onClick={() => onDelete(template)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </TabsContent>
  )
}
