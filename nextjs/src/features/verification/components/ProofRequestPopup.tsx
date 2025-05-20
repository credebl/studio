'use client'

import { JSX, useState } from 'react'

import AttributesListData from './AttributesListData'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { IProofRrquestDetails } from '../type/interface'
import Loader from '@/components/Loader'
import { Modal } from '@/components/Modal'
import { Roles } from '@/common/enums'
import { apiStatusCodes } from '@/config/CommonConstant'
import { pathRoutes } from '@/config/pathRoutes'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'
import { verifyPresentation } from '@/app/api/verification'

interface UserDataItem {
  schemaId?: string
  [key: string]: string | number | boolean | undefined
}

const ProofRequest = (props: IProofRrquestDetails): JSX.Element => {
  const [buttonLoader, setButtonLoader] = useState(false)
  const [navigation, setNavigation] = useState(false)
  const [succesMsg, setSuccesMsg] = useState('')
  const [error, setError] = useState('')
  const orgId = useAppSelector((state) => state.organization.orgId)
  const router = useRouter()

  const handleConfirmClick = async (id: string): Promise<void> => {
    try {
      setButtonLoader(true)
      const response = await verifyPresentation(id, orgId)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setSuccesMsg(data.message)
        setNavigation(true)
      }
    } catch (err) {
      setError((err as Error)?.message || 'Verification failed.')
    } finally {
      setButtonLoader(false)
    }
  }

  const handleClose = (): void => {
    setButtonLoader(false)
    props.closeModal(false, '', false)
    if (navigation) {
      router.push(pathRoutes.organizations.credentials)
    }
  }

  const isDisabled =
    navigation ||
    (props?.userRoles ?? []).every((role) =>
      [Roles.MEMBER, Roles.ISSUER].includes(role as Roles),
    )

  return (
    <Modal
      open={props.openModal}
      onClose={() => props.closeModal(false, '', false)}
      title="Verification Details"
    >
      <div className="relative m-5 rounded-lg p-4 text-center shadow sm:p-5">
        <div className="m-4 sm:p-2 lg:p-6">
          <p className="flex-start flex pb-2 text-xl font-semibold">
            {props.view ? 'Verified Details' : 'Verification Details'}
          </p>

          {!props.view && succesMsg && (
            <div className="mb-4 rounded-lg p-4 text-sm" role="alert">
              {succesMsg}
            </div>
          )}
          {!props.view && error && (
            <div className="mb-4 rounded-lg p-4 text-sm" role="alert">
              {error}
            </div>
          )}

          {props.verifyLoading ? (
            <div className="m-4 flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <div className="mt-1 w-full">
              <AttributesListData
                attributeDataList={props?.userData?.map(
                  (item: UserDataItem) => ({
                    schemaId: item.schemaId ?? '',
                    ...item,
                  }),
                )}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={handleClose}
            disabled={props.verifyLoading}
            style={{ height: '2.5rem', minWidth: '100px' }}
            className="medium rounded-lg border px-2 py-1 text-center font-medium focus:z-10 focus:ring-4 focus:outline-none"
          >
            {navigation || props.view ? 'Close' : 'No, cancel'}
          </Button>

          {!props.view && (
            <Button
              onClick={() => handleConfirmClick(props.requestId)}
              disabled={isDisabled}
              style={{ height: '2.5rem', minWidth: '3rem' }}
              className="medium bg-primary hover:bg-primary focus:ring-primary dark:bg-primary dark:hover:bg-primary dark:focus:ring-primary flex items-center gap-2 rounded-lg px-2 py-1 text-center focus:ring-4"
            >
              {buttonLoader ? (
                <Loader />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 17 17"
                  className="text-black"
                >
                  <path
                    fill="currentColor"
                    d="M15.749 6.99c-.334-.21-.813-.503-.813-.697.01-.397.113-.786.3-1.136.277-.69.561-1.395.204-1.915-.358-.519-1.122-.462-1.853-.405-.358.082-.73.082-1.089 0a2.74 2.74 0 0 1-.374-1.087c-.162-.739-.333-1.501-.942-1.704-.61-.203-1.154.3-1.699.811-.309.276-.723.65-.934.65-.212 0-.634-.374-.943-.65C7.07.362 6.51-.14 5.908.046c-.602.187-.805.933-.967 1.671-.05.383-.18.75-.382 1.08a2.295 2.295 0 0 1-1.09 0c-.722-.066-1.478-.13-1.844.405-.365.535-.081 1.225.195 1.914.19.35.295.739.31 1.136-.066.195-.521.487-.854.698C.65 7.34 0 7.76 0 8.41c0 .649.65 1.07 1.276 1.468.333.211.812.495.853.69-.014.4-.12.791-.309 1.144-.276.69-.56 1.395-.195 1.914.366.52 1.122.463 1.845.398a2.441 2.441 0 0 1 1.089.04c.2.33.33.697.382 1.08.162.738.333 1.508.934 1.711a.86.86 0 0 0 .277.106 2.439 2.439 0 0 0 1.422-.812c.308-.275.731-.657.942-.657.212 0 .626.382.935.657.544.487 1.105.998 1.698.812.593-.187.813-.974.943-1.712a2.69 2.69 0 0 1 .374-1.08 2.472 2.472 0 0 1 1.089-.04c.73.065 1.479.138 1.852-.397.374-.536.073-1.225-.203-1.915a2.585 2.585 0 0 1-.3-1.144c.056-.194.511-.478.812-.69C16.35 9.587 17 9.174 17 8.517c0-.658-.618-1.136-1.251-1.526Zm-.431 2.248c-.537.332-1.04.649-1.195 1.135a2.73 2.73 0 0 0 .325 1.68c.155.373.399.99.293 1.151-.106.163-.731.09-1.113.057a2.393 2.393 0 0 0-1.626.203 2.594 2.594 0 0 0-.682 1.55c-.082.365-.236 1.054-.406 1.111-.171.057-.667-.422-.894-.625a2.585 2.585 0 0 0-1.48-.868c-.58.11-1.105.417-1.486.868-.22.203-.756.674-.894.625-.138-.049-.325-.746-.407-1.111a2.594 2.594 0 0 0-.674-1.55 1.522 1.522 0 0 0-.95-.243 7.016 7.016 0 0 0-.708.04c-.374 0-1.008.09-1.105-.056-.098-.146.097-.78.26-1.112.285-.51.4-1.1.325-1.68-.146-.486-.65-.81-1.186-1.135-.358-.227-.902-.568-.902-.811 0-.244.544-.552.902-.811.536-.333 1.04-.658 1.186-1.136a2.754 2.754 0 0 0-.325-1.688c-.163-.348-.398-.973-.284-1.127.113-.154.73-.09 1.105-.057.549.122 1.123.05 1.625-.203.392-.427.629-.972.674-1.55.082-.364.236-1.054.407-1.11.17-.058.674.421.894.624.381.45.907.753 1.487.86a2.569 2.569 0 0 0 1.479-.86c.227-.203.756-.673.894-.625.138.049.325.747.406 1.112.048.578.288 1.123.682 1.55a2.397 2.397 0 0 0 1.626.202c.382 0 1.007-.09 1.113.057.106.146-.138.811-.292 1.144a2.755 2.755 0 0 0-.326 1.687c.155.479.659.811 1.195 1.136.357.227.902.568.902.811 0 .243-.488.527-.845.755Z"
                  />
                  <path
                    fill="currentColor"
                    d="m11.253 6.126-3.78 3.943-1.687-1.403a.473.473 0 0 0-.149-.08.556.556 0 0 0-.352 0 .473.473 0 0 0-.148.08.377.377 0 0 0-.101.12.306.306 0 0 0 0 .284.377.377 0 0 0 .101.12l2.002 1.7a.459.459 0 0 0 .152.083.548.548 0 0 0 .181.027.601.601 0 0 0 .19-.043.499.499 0 0 0 .153-.097l4.105-4.284a.312.312 0 0 0 .074-.265.365.365 0 0 0-.174-.234.55.55 0 0 0-.632.049h.065Z"
                  />
                </svg>
              )}
              Verify
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ProofRequest
