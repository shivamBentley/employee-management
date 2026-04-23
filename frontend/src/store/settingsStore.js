import { create } from 'zustand';
import { getSettings } from '../modules/settings/api';

const useSettingsStore = create((set, get) => ({
  settings: {},
  loading: false,
  loaded: false,

  fetchSettings: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const { data } = await getSettings();
      set({ settings: data.settings ?? {}, loaded: true });
    } catch {
      set({ settings: {}, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  invalidate: () => set({ loaded: false }),
}));

export default useSettingsStore;
