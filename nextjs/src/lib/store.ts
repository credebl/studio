import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'

import authSlice from './authSlice'
import orgSlice from './orgSlice'
import profileSlice from './profileSlice'
import storage from 'redux-persist/lib/storage'
<<<<<<< HEAD
import storageReducer from './storageKeys'
=======
>>>>>>> 0d64de2fb3d9b4cc29eae62caa11a7f558035247
import userSlice from './userSlice'
import walletSpinupSlice from './walletSpinupSlice'

const rootReducer = combineReducers({
  auth: authSlice,
  profile: profileSlice,
  organization: orgSlice,
  storageKeys: storageReducer,
  user: userSlice,
  wallet: walletSpinupSlice,
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'profile', 'organization','storageKeys', 'user', 'wallet']
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
