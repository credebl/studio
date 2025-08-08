import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'

import authSlice from './authSlice'
import orgSlice from './orgSlice'
import profileSlice from './profileSlice'
import schemaSlice from './schemaSlice'
import schemaStorageSlice from './schemaStorageSlice'
import sidebarSlice from './sidebarSlice'
import socketReducer from './socketSlice'
import storage from 'redux-persist/lib/storage'
import storageReducer from './storageKeys'
import userSlice from './userSlice'
import verificationSlice from './verificationSlice'
import walletSpinupSlice from './walletSpinupSlice'

const rootReducer = combineReducers({
  auth: authSlice,
  profile: profileSlice,
  organization: orgSlice,
  storageKeys: storageReducer,
  user: userSlice,
  wallet: walletSpinupSlice,
  socket: socketReducer,
  verification: verificationSlice,
  sidebar: sidebarSlice,
  schema: schemaSlice,
  schemaStorage: schemaStorageSlice,
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [
    'auth',
    'profile',
    'organization',
    'storageKeys',
    'user',
    'wallet',
    'socket',
    'verification',
    'schema',
    'schemaStorage',
  ],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
