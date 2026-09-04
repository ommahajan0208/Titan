import { create } from 'zustand'
import type { AppMode, NavId, Notification } from '../types'

interface AppStore {
  // Mode: defender (Blue Team view) or attacker (Red Team view)
  mode: AppMode
  setMode: (mode: AppMode) => void

  // Navigation
  activeTab: NavId
  setActiveTab: (tab: NavId) => void

  // Demo mode - uses mockData, makes zero network calls
  isDemoMode: boolean
  setDemoMode: (enabled: boolean) => void

  // Active model version shown in the topbar
  currentModelVersion: string
  setCurrentModelVersion: (version: string) => void

  // War Room active run
  activeRunId: string | null
  setActiveRunId: (runId: string | null) => void

  // Judge Demo modal
  isJudgeDemoOpen: boolean
  setJudgeDemoOpen: (open: boolean) => void
  judgeDemoStep: number
  setJudgeDemoStep: (step: number) => void

  // Global notifications
  notifications: Notification[]
  addNotification: (n: Omit<Notification, 'id' | 'timestamp'>) => void
  dismissNotification: (id: string) => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  mode: 'defender',
  setMode: (mode) => set({ mode }),

  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isDemoMode: import.meta.env.VITE_DEMO_MODE === 'true',
  setDemoMode: (enabled) => set({ isDemoMode: enabled }),

  currentModelVersion: 'v3.0',
  setCurrentModelVersion: (version) => set({ currentModelVersion: version }),

  activeRunId: null,
  setActiveRunId: (runId) => set({ activeRunId: runId }),

  isJudgeDemoOpen: false,
  setJudgeDemoOpen: (open) => set({ isJudgeDemoOpen: open }),
  judgeDemoStep: 0,
  setJudgeDemoStep: (step) => set({ judgeDemoStep: step }),

  notifications: [],
  addNotification: (n) => {
    const notification: Notification = {
      ...n,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    }
    set(state => ({ notifications: [...state.notifications, notification] }))
    // Auto-dismiss info/success after 5s
    if (n.type === 'info' || n.type === 'success') {
      setTimeout(() => get().dismissNotification(notification.id), 5000)
    }
  },
  dismissNotification: (id) =>
    set(state => ({ notifications: state.notifications.filter(n => n.id !== id) })),
}))
