'use client'

import { IssueCredential, IssueCredentialUserText } from '@/common/enums'

import DateTooltip from '@/components/DateTooltip'
import { dateConversion } from '@/utils/DateConversion'
import { useRouter } from 'next/navigation'

export const ConnectionIdCell = ({
  connectionId,
}: {
  connectionId: string
}): React.JSX.Element => (
  <span className="text-muted-foreground text-sm">
    {connectionId ?? 'Not Available'}
  </span>
)

interface SchemaNameCellProps {
  schemaName: string
  schemaId: string
  isW3C: boolean
}

export const SchemaNameCell = ({
  schemaName,
  schemaId,
  isW3C,
}: SchemaNameCellProps): React.JSX.Element => {
  const router = useRouter()

  if (!schemaName) {
    return <span className="text-muted-foreground text-sm">Not Available</span>
  }

  return (
    <button
      onClick={() => {
        if (schemaId && !isW3C) {
          router.push(`/organizations/schemas/${schemaId}`)
        } else {
          router.push('/organizations/schemas')
        }
      }}
      className="cursor-pointer border-none bg-transparent p-0 text-sm hover:underline"
    >
      {schemaName}
    </button>
  )
}

export const DateCell = ({ date }: { date: string }): React.JSX.Element => {
  const safeDate = date || new Date().toISOString()
  return (
    <DateTooltip date={safeDate}>
      <span className="text-muted-foreground text-sm">
        {dateConversion(safeDate)}
      </span>
    </DateTooltip>
  )
}

export const StatusCellForCredential = ({
  state,
}: {
  state: string
}): React.JSX.Element => {
  let className = 'badges-secondary text-foreground'
  let text = IssueCredentialUserText.credIssued

  switch (state) {
    case IssueCredential.offerSent:
      className = 'badges-warning text-foreground'
      text = IssueCredentialUserText.offerSent
      break
    case IssueCredential.done:
      className = 'badges-success text-foreground'
      text = IssueCredentialUserText.done
      break
    case IssueCredential.abandoned:
      className = 'badges-error text-foreground'
      text = IssueCredentialUserText.abandoned
      break
    case IssueCredential.requestReceived:
      className = 'bg-primary text-foreground'
      text = IssueCredentialUserText.received
      break
    case IssueCredential.proposalReceived:
      className = 'status-proposal-received'
      text = IssueCredentialUserText.proposalReceived
      break
    default:
      console.warn(`Unknown credential state: ${state}`)
  }

  return (
    <span
      className={`${className} mr-0.5 flex w-fit items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium`}
    >
      {text}
    </span>
  )
}
