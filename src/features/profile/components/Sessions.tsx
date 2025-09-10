import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { JSX, useEffect, useState } from 'react'
import { apiStatusCodes, confirmationMessages } from '@/config/CommonConstant'
import { getUserSessions, sessionDelete } from '@/app/api/Auth'

import { AlertComponent } from '@/components/AlertComponent'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ConfirmationModal from '@/components/confirmation-modal'
import { DeleteIcon } from '@/config/svgs/DeleteIcon'
import Loader from '@/components/Loader'
import { Monitor } from 'lucide-react'
import { RootState } from '@/lib/store'
import { dateConversion } from '@/utils/DateConversion'
import { session } from '../type/session'
import { useAppSelector } from '@/lib/hooks'

function Sessions(): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<session>()
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
          sessions.map((record) => (
            <div
              key={record.id}
              className="mt-2 flex flex-col items-center justify-between rounded-md border p-4 md:flex-row"
            >
              <div className="flex items-center gap-4">
                <div>
                  <Monitor
                    size={50}
                    strokeWidth={1}
                    className="text-muted-foreground"
                  />
                </div>
                <div>
                  <div>
                    ID:{' '}
                    <span className="text-muted-foreground break-all">
                      {record.id}
                    </span>
                  </div>
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
                      {record.sessionType}
                    </span>
                  </div>
                </div>
              </div>
              <div className="sm:w-0.5/3 text-destructive">
                {record.id === currentSession ? (
                  <Badge className="success-alert rounded-full p-1 px-3">
                    Current Session
                  </Badge>
                ) : (
                  <Button
                    data-testid="deleteBtn"
                    type="button"
                    color="danger"
                    onClick={() => {
                      setShowConfirmation(true)
                      setDeletionId(record.id)
                    }}
                    className="flex justify-end bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0"
                  >
                    <DeleteIcon />
                  </Button>
                )}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}

export default Sessions
