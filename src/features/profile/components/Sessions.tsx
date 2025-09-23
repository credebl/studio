import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { JSX, useEffect, useState } from 'react'
import { Monitor, Smartphone, UserCog } from 'lucide-react'
import { Session, clientInfo } from '../type/session'
import { apiStatusCodes, confirmationMessages } from '@/config/CommonConstant'
import { getUserSessions, sessionDelete } from '@/app/api/Auth'

import { AlertComponent } from '@/components/AlertComponent'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ConfirmationModal from '@/components/confirmation-modal'
import { DeleteIcon } from '@/config/svgs/DeleteIcon'
import Loader from '@/components/Loader'
import { RootState } from '@/lib/store'
import { SESSION_TYPE } from '@/components/types/Sessions'
import { dateConversion } from '@/utils/DateConversion'
import { useAppSelector } from '@/lib/hooks'

function Sessions(): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState<string>('')
  const [sessions, setSessions] = useState<Session[]>()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deletionId, setDeletionId] = useState<string | null>(null)

  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const userId = useAppSelector((state: RootState) => state.profile.id)
  const currentSession = useAppSelector(
    (state: RootState) => state.auth.sessionId,
  )

  const fetchSessions = async (): Promise<void> => {
    if (!userId) {
      setLoading(false)
      setError('User id is missing')
      return
    }

    try {
      const response = await getUserSessions(userId ?? '')
      if (
        typeof response !== 'string' &&
        response?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
      ) {
        setSessions(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching user sessions:', error)
      setError('Error Fetching Session')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleDelete = async (): Promise<void> => {
    if (!deletionId) {
      setLoading(false)
      setError('Session id is missing')
      return
    }

    try {
      const response = await sessionDelete(deletionId ?? '')
      if (
        typeof response !== 'string' &&
        response?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
      ) {
        setShowConfirmation(false)
        setSuccess('Session Deleted Successfully')
        fetchSessions()
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      setError('Error Deleting Session')
    } finally {
      setLoading(false)
    }
  }

  function getSessionIcon(
    record: Session,
    clientInfo: clientInfo,
  ): JSX.Element {
    if (record.sessionType === SESSION_TYPE.ORGANIZATION) {
      return (
        <UserCog size={44} strokeWidth={1} className="text-muted-foreground" />
      )
    }

    const deviceIcons: Record<string, JSX.Element> = {
      desktop: (
        <Monitor size={50} strokeWidth={1} className="text-muted-foreground" />
      ),
      mobile: (
        <Smartphone
          size={44}
          strokeWidth={1}
          className="text-muted-foreground"
        />
      ),
    }

    if (record.sessionType === SESSION_TYPE.USER) {
      return deviceIcons[clientInfo.deviceType] ?? deviceIcons['desktop']
    }

    return deviceIcons['desktop']
  }

  if (!loading && (!sessions || sessions.length === 0)) {
    return <div>No session Details</div>
  }

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    )
  }

  return (
    <Card className="border py-6">
      <CardTitle className="px-4">User Sessions</CardTitle>
      <CardContent className="overflow-y-auto py-4">
        {success && (
          <div className="w-full" role="alert">
            <AlertComponent
              message={success}
              type={'success'}
              onAlertClose={() => {
                setSuccess(null)
              }}
            />
          </div>
        )}
        {error && (
          <div className="w-full" role="alert">
            <AlertComponent
              message={error}
              type={'failure'}
              onAlertClose={() => {
                setError(null)
              }}
            />
          </div>
        )}

        <ConfirmationModal
          loading={false}
          success={success}
          failure={error}
          openModal={showConfirmation}
          closeModal={() => setShowConfirmation(false)}
          onSuccess={handleDelete}
          message={'This Session will be Deleted Permanently.'}
          buttonTitles={[
            confirmationMessages.cancelConfirmation,
            confirmationMessages.sureConfirmation,
          ]}
          isProcessing={loading}
          setFailure={setError}
          setSuccess={setSuccess}
        />
        {sessions &&
          Array.isArray(sessions) &&
          sessions.map((record) => {
            const clientInfo =
              typeof record.clientInfo === 'string'
                ? JSON.parse(record?.clientInfo)
                : record?.clientInfo
            return (
              <div
                key={record?.id}
                className="mt-2 rounded-md border p-4 md:flex-row"
              >
                <div className="flex flex-col items-center justify-between md:flex-row">
                  <div className="flex items-center gap-4">
                    <div className="px-2">
                      {clientInfo ? (
                        getSessionIcon(record, clientInfo)
                      ) : (
                        <Monitor
                          size={50}
                          strokeWidth={1}
                          className="text-muted-foreground"
                        />
                      )}
                    </div>
                    <div>
                      {clientInfo?.ip && (
                        <div>
                          IP:{' '}
                          <span className="text-muted-foreground break-all">
                            {clientInfo?.ip ?? 'Not Available'}
                          </span>
                        </div>
                      )}
                      <div>
                        Created:{' '}
                        <span className="text-muted-foreground">
                          {dateConversion(record.createdAt)}
                        </span>
                      </div>
                      <div>
                        Expires:{' '}
                        <span className="text-muted-foreground">
                          {dateConversion(record.expiresAt)}
                        </span>
                      </div>
                      <div>
                        Type:{' '}
                        <span className="text-muted-foreground">
                          {record.sessionType === SESSION_TYPE.ORGANIZATION
                            ? 'Client Session'
                            : 'User Session'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`sm:w-0.5/3 flex h-[100px] items-center ${record.sessionType !== SESSION_TYPE.ORGANIZATION && clientInfo?.ip && 'pt-10'}`}
                  >
                    {record?.id === currentSession ? (
                      <Badge className="success-alert rounded-full p-1 px-3">
                        Current Session
                      </Badge>
                    ) : (
                      <div>
                        <Button
                          data-testid="deleteBtn"
                          type="button"
                          color="danger"
                          onClick={() => {
                            setError(null)
                            setSuccess(null)
                            setShowConfirmation(true)
                            setDeletionId(record.id)
                          }}
                          className="flex justify-end bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0"
                        >
                          <DeleteIcon />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {clientInfo?.ip &&
                  record.sessionType !== SESSION_TYPE.ORGANIZATION && (
                    <Button
                      onClick={() => {
                        setShowDetails((prev) => {
                          if (record.id === prev) {
                            return ''
                          }
                          return record.id
                        })
                      }}
                      variant={'secondary'}
                      className="mt-2 h-[30px] px-2"
                    >
                      {showDetails === record.id
                        ? 'Hide Details'
                        : 'Show Details'}
                    </Button>
                  )}
                {clientInfo && (
                  <div
                    className={`${showDetails === record.id ? 'mt-6 h-auto rounded-md border p-4' : ''} mt-2 flex h-[0px] items-center justify-between overflow-hidden text-sm transition-all duration-500`}
                  >
                    <div className="grid justify-center">
                      <dt>Browser</dt>
                      <dd className="text-muted-foreground">
                        {clientInfo?.browser}
                      </dd>
                    </div>
                    <div className="grid justify-center">
                      <dt>OS</dt>
                      <dd className="text-muted-foreground">
                        {clientInfo?.os}
                      </dd>
                    </div>
                    <div className="grid justify-center">
                      <dt>Device</dt>
                      <dd className="text-muted-foreground">
                        {clientInfo?.deviceType}
                      </dd>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
      </CardContent>
    </Card>
  )
}

export default Sessions
