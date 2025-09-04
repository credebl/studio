import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import CopyDid from '@/config/CopyDid'
import React from 'react'
import { Roles } from '@/common/enums'
import { pathRoutes } from '@/config/pathRoutes'
import { setSchemaDetails } from '@/lib/schemaStorageSlice'
import { useAppDispatch } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

interface IProps {
  credDefName: string
  userRoles?: string[]
  credentialDefinitionId: string
  schemaId: string
  revocable: boolean
}

const CredentialDefinitionCard = (props: IProps): React.ReactElement => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const redirectToIssuance = async (): Promise<void> => {
    if (
      props?.userRoles?.includes(Roles.OWNER) ||
      props?.userRoles?.includes(Roles.ADMIN) ||
      props?.userRoles?.includes(Roles.ISSUER)
    ) {
      dispatch(
        setSchemaDetails({
          type: 'CREDENTIAL_DEFINITION',
          nonW3cSchema: props.credentialDefinitionId,
        }),
      )
      router.push(pathRoutes.organizations.Issuance.issue)
    }
  }

  return (
    <Card
      className="h-full overflow-hidden p-4 overflow-ellipsis"
      style={{ maxHeight: '100%', maxWidth: '100%', overflow: 'auto' }}
    >
      <div className="mb-1 flex flex-wrap items-center justify-between">
        <div className="max-w-100/8rem min-w-[6rem]">
          <h5
            className="line-clamp-2 max-h-[40px] truncate text-xl leading-none font-bold break-words whitespace-normal"
            style={{ display: '-webkit-box' }}
          >
            {props.credDefName}
          </h5>
        </div>
        <div className="p-2">
          <Button
            onClick={redirectToIssuance}
            type="submit"
            title="Initiate Credential Issuance"
            variant="outline"
            className="flex items-center rounded-xl border px-4 py-2 transition-colors"
            disabled={
              !(
                props.userRoles &&
                (props.userRoles.includes(Roles.OWNER) ||
                  props.userRoles.includes(Roles.ADMIN) ||
                  props.userRoles.includes(Roles.ISSUER))
              )
            }
          >
            <div className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 23 23"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M21 21H2V2h9.5V0H2.556A2.563 2.563 0 0 0 0 2.556v17.888A2.563 2.563 0 0 0 2.556 23h17.888A2.563 2.563 0 0 0 23 20.444V11.5h-2V21ZM14.056 0v2H19.5l-13 13 1 1.5L21 3v5.944h2V0h-8.944Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            Issue
          </Button>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex truncate text-sm font-medium">
          <span className="mr-2 font-semibold">ID:</span>
          <span className="w-view-cred-def-id flex">
            <CopyDid
              value={props?.credentialDefinitionId || ''}
              className="font-courier truncate"
            />
          </span>
        </div>

        <div className="flex truncate pt-2 pb-1 text-sm font-medium">
          <span className="mr-2 font-semibold">Schema ID:</span>
          <div className="w-view-schema-id flex">
            <CopyDid
              value={props?.schemaId || ''}
              className="font-courier truncate"
            />
          </div>
        </div>

        <div className="mt-auto inline-flex items-center overflow-hidden text-base font-semibold overflow-ellipsis">
          Revocable:{' '}
          <span className="bg-secondary text-secondary-foreground hover:bg-secondary/80 m-1 mr-2 rounded px-2.5 py-0.5 text-sm font-medium shadow-sm">
            {props?.revocable ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default CredentialDefinitionCard
