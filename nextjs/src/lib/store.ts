import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authSlice from './authSlice'
import profileSlice from './profileSlice'
import orgSlice from './orgSlice'

const rootReducer = combineReducers({
  auth : authSlice,
  profile: profileSlice,
  organization: orgSlice
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'profile', 'organization']
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
