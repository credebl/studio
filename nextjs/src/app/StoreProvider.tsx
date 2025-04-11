'use client'

import { AppStore, makeStore } from '../lib/store'

import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import { JSX, useRef } from 'react'

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const storeRef = useRef<AppStore | undefined>(undefined)
  const persistorRef = useRef<any>(undefined)

  if (!storeRef.current) {
    storeRef.current = makeStore()
    persistorRef.current = persistStore(storeRef.current)
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistorRef.current}>
        {children}
      </PersistGate>
    </Provider>
  )
}
