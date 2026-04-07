import { create } from "zustand";
import type { Alert } from "@ozpulse/shared-types";

interface AlertsState {
  alerts: Alert[];
  unreadCount: number;

  addAlert: (alert: Alert) => void;
  addAlerts: (alerts: Alert[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

function countUnread(alerts: Alert[]): number {
  return alerts.filter((a) => !a.read && !a.dismissed).length;
}

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: [],
  unreadCount: 0,

  addAlert: (alert) =>
    set((s) => {
      const alerts = [alert, ...s.alerts].slice(0, 100);
      return { alerts, unreadCount: countUnread(alerts) };
    }),

  addAlerts: (newAlerts) =>
    set((s) => {
      const alerts = [...newAlerts, ...s.alerts].slice(0, 100);
      return { alerts, unreadCount: countUnread(alerts) };
    }),

  markRead: (id) =>
    set((s) => {
      const alerts = s.alerts.map((a) =>
        a.id === id ? { ...a, read: true } : a
      );
      return { alerts, unreadCount: countUnread(alerts) };
    }),

  markAllRead: () =>
    set((s) => ({
      alerts: s.alerts.map((a) => ({ ...a, read: true })),
      unreadCount: 0,
    })),

  dismiss: (id) =>
    set((s) => {
      const alerts = s.alerts.map((a) =>
        a.id === id ? { ...a, dismissed: true } : a
      );
      return { alerts, unreadCount: countUnread(alerts) };
    }),

  clearAll: () => set({ alerts: [], unreadCount: 0 }),
}));
