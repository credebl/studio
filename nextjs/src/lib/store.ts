import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';

import storage from 'redux-persist/lib/storage';
import authSlice from './authSlice';
import orgSlice from './orgSlice';
import profileSlice from './profileSlice';
import userSlice from './userSlice';
import schemaSlice from './schemaSlice';
import verificationSlice from './verificationSlice';

const rootReducer = combineReducers({
  auth: authSlice,
  profile: profileSlice,
  organization: orgSlice,
  user: userSlice,
  schemas: schemaSlice,
  verification: verificationSlice,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'profile', 'organization', 'user', 'schemas','verification']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
