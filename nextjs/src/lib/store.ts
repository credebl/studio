import { Reducer, combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'

import authSlice from './authSlice'
import orgSlice from './orgSlice'
import profileSlice from './profileSlice'
import schemaSlice from './schemaSlice'
import storage from 'redux-persist/lib/storage'
import userSlice from './userSlice'
import verificationSlice from './verificationSlice'
import walletSpinupSlice from './walletSpinupSlice'

const appReducer = combineReducers({
  auth: authSlice,
  profile: profileSlice,
  organization: orgSlice,
  user: userSlice,
  schemas: schemaSlice,
  verification: verificationSlice,
  wallet: walletSpinupSlice,
})

const rootReducer: Reducer = (state, action) => {
  if (action.type === 'auth/logout') {
    return appReducer(undefined, action)
  }
  return appReducer(state, action)
}

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [
    'auth',
    'profile',
    'organization',
    'user',
    'wallet',
    'schemas',
    'verification',
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
