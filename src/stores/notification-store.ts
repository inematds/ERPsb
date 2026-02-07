import { create } from 'zustand';

interface NotificationState {
  count: number;
  increment: () => void;
  reset: () => void;
  setCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
  setCount: (count: number) => set({ count }),
}));
