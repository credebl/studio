import type { AppDispatch, RootState } from './store';
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  useStore
} from 'react-redux';

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = () => useStore<RootState>();
