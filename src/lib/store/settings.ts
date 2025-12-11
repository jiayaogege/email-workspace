import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
  backgroundImage?: string;
  autoRefreshInterval: number;
  editMode: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'zh' | 'en') => void;
  setBackgroundImage: (url: string) => void;
  setAutoRefreshInterval: (interval: number) => void;
  setEditMode: (editMode: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'zh',
      backgroundImage: '',
      autoRefreshInterval: 30000,
      editMode: false,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setBackgroundImage: (backgroundImage) => set({ backgroundImage }),
      setAutoRefreshInterval: (interval) => set({ autoRefreshInterval: interval }),
      setEditMode: (editMode) => set({ editMode }),
    }),
    {
      name: 'alle-settings',
    }
  )
);
