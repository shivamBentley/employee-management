import { create } from 'zustand';

let _nextId = 0;

const useToastStore = create((set) => ({
  toasts: [],

  toast: (message, type = 'success', duration = 3500) => {
    const id = ++_nextId;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },

  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export default useToastStore;
