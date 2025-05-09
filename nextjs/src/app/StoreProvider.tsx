'use client';

import React from 'react';
import { store, persistor } from '../lib/store';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';

interface StoreProviderProps {
  readonly children: React.ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
