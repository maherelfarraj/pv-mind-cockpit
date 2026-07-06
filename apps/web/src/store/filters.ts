import { create } from 'zustand'

import type { ProjectStatus } from '@pv-mind/core'

interface DashboardFilterState {
  status: ProjectStatus | 'all'
  setStatus: (status: ProjectStatus | 'all') => void
}

export const useDashboardFilters = create<DashboardFilterState>((set) => ({
  status: 'all',
  setStatus: (status) => set({ status })
}))
