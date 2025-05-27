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
      className="text-primary-600 cursor-pointer border-none bg-transparent p-0 text-sm hover:underline"
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
}): React.JSX.Element => (
  <span
    className={`${
      state === IssueCredential.offerSent
        ? 'badges-warning text-foreground'
        : state === IssueCredential.done
          ? 'badges-success text-foreground'
          : state === IssueCredential.abandoned
            ? 'badges-error text-foreground'
            : state === IssueCredential.requestReceived
              ? 'bg-primary text-foreground'
              : state === IssueCredential.proposalReceived
                ? 'status-proposal-received'
                : 'badges-secondary text-foreground'
    } mr-0.5 flex w-fit items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium`}
  >
    {state === IssueCredential.offerSent
      ? IssueCredentialUserText.offerSent
      : state === IssueCredential.done
        ? IssueCredentialUserText.done
        : state === IssueCredential.abandoned
          ? IssueCredentialUserText.abandoned
          : state === IssueCredential.requestReceived
            ? IssueCredentialUserText.received
            : state === IssueCredential.proposalReceived
              ? IssueCredentialUserText.proposalReceived
              : IssueCredentialUserText.credIssued}
  </span>
)
