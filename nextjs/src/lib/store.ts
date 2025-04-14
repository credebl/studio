// import { combineReducers, configureStore } from '@reduxjs/toolkit';
// import { persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import userReducer from './userSlice';

// const rootReducer = combineReducers({
//   user: userReducer
// });

// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['user']
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const makeStore = () =>
//   configureStore({
//     reducer: persistedReducer,
//     middleware: (getDefaultMiddleware) =>
//       getDefaultMiddleware({
//         serializableCheck: false
//       })
//   });

// export type AppStore = ReturnType<typeof makeStore>;
// export type RootState = ReturnType<AppStore['getState']>;
// export type AppDispatch = AppStore['dispatch'];


// redux/store.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
// import userReducer from './userSlice'
import authSlice from './authSlice'
import profileSlice from './profileSlice'
import orgSlice from './orgSlice'

const rootReducer = combineReducers({
  // user: userReducer,
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
