import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>;
}

const initialState: UiState = {
  sidebarOpen: false,
  theme: 'dark',
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    addNotification: (state, action: PayloadAction<UiState['notifications'][0]>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
  },
});

export const { 
  toggleSidebar, 
  setSidebarOpen, 
  setTheme, 
  addNotification, 
  removeNotification 
} = uiSlice.actions;

export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectNotifications = (state: RootState) => state.ui.notifications;

export default uiSlice.reducer;