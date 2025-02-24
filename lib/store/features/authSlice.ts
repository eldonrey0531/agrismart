import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState } from '@/types/auth';
import { Session } from 'next-auth';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      if (action.payload?.user) {
        state.user = {
          id: action.payload.user.id as string,
          email: action.payload.user.email as string,
          name: action.payload.user.name,
          image: action.payload.user.image,
        };
        state.isAuthenticated = true;
      } else {
        state.user = null;
        state.isAuthenticated = false;
      }
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    reset: () => initialState,
  },
});

// Export actions
export const { 
  setSession,
  setLoading,
  setError,
  reset 
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
