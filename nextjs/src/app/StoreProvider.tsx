'use client'

import { persistor, store } from '../lib/store'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import React from 'react'

interface StoreProviderProps {
  readonly children: React.ReactNode
}

export default function StoreProvider({
  children,
}: StoreProviderProps): JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
