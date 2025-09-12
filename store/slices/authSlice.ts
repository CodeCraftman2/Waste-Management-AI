import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

interface AuthState {
  user: {
    id?: number;
    name?: string;
    email?: string;
    points?: number;
    level?: number;
  } | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    updateUserPoints: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.points = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, updateUserPoints, setLoading, logout } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectUserPoints = (state: RootState) => state.auth.user?.points || 0;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;

export default authSlice.reducer;