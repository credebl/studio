import type { AxiosResponse } from 'axios'
import { IDidListData } from '@/features/organization/components/interfaces/organization'
import React from 'react'
import { getDidKms } from '@/app/api/Agent'

/** How many lookups run at the same time. */
const CONCURRENCY = 2

/**
 * Looks up the KMS backend of every DID in the list that has none yet (DIDs created before it was recorded) and
 * fills it in. The platform persists what it learns, so each DID is asked about once, and a failed lookup leaves the
 * DID without a backend. Each finished lookup updates the list, which starts the next ones.
 */
export function useKmsBackendLookup(
  didList: IDidListData[],
  setDidList: React.Dispatch<React.SetStateAction<IDidListData[]>>,
  orgId: string,
): void {
  const attempted = React.useRef<Set<string>>(new Set())
  const inFlight = React.useRef(0)
  const unmounted = React.useRef(false)
  const [round, setRound] = React.useState(0)

  React.useEffect(() => {
    unmounted.current = false
    return () => {
      unmounted.current = true
    }
  }, [])

  React.useEffect(() => {
    const free = Math.max(CONCURRENCY - inFlight.current, 0)
    const pending = didList
      .filter(
        (item) =>
          item.did && !item.kmsBackend && !attempted.current.has(item.did),
      )
      .slice(0, free)

    pending.forEach(async ({ did }) => {
      attempted.current.add(did)
      inFlight.current += 1
      try {
        const response = await getDidKms(orgId, did)
        const backend =
          typeof response === 'string'
            ? null
            : ((response as AxiosResponse).data?.data?.kmsBackend ?? null)
        if (!unmounted.current && backend) {
          setDidList((prev) =>
            prev.map((item) => {
              if (item.did === did) {
                return { ...item, kmsBackend: backend }
              }
              return item
            }),
          )
        }
      } catch {
        // leave the DID without a backend
      } finally {
        inFlight.current -= 1
        if (!unmounted.current) {
          setRound((value) => value + 1)
        }
      }
    })
  }, [didList, orgId, round, setDidList])
}
