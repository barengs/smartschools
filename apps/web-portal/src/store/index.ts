import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import financeReducer from './slices/financeSlice';
import portalReducer from './slices/portalSlice';
import ppdbAdminReducer from './slices/ppdbAdminSlice';
import ppdbPublicReducer from './slices/ppdbPublicSlice';
import siakadReducer from './slices/siakadSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    portal: portalReducer,
    ppdbPublic: ppdbPublicReducer,
    ppdbAdmin: ppdbAdminReducer,
    siakad: siakadReducer,
    finance: financeReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
