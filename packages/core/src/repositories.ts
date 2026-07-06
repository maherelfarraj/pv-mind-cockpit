import type { SupabaseClient } from '@supabase/supabase-js'

import { createMockSnapshot } from './mock-data'
import type { DashboardSnapshot, DraftItem, StorageUpload } from './types'

export interface CockpitRepository {
  getDashboardSnapshot(): Promise<DashboardSnapshot>
  saveDraft(draft: Omit<DraftItem, 'updatedAt'> & { updatedAt?: string }): Promise<DraftItem>
  listDrafts(): Promise<DraftItem[]>
}

export interface ReportStorageAdapter {
  uploadReport(fileName: string, content: string): Promise<StorageUpload>
}

export function createMockCockpitRepository(initialSnapshot = createMockSnapshot()): CockpitRepository {
  let snapshot = structuredClone(initialSnapshot)

  return {
    async getDashboardSnapshot() {
      return structuredClone(snapshot)
    },
    async saveDraft(draft) {
      const nextDraft: DraftItem = {
        ...draft,
        updatedAt: draft.updatedAt ?? new Date().toISOString()
      }
      snapshot = {
        ...snapshot,
        drafts: [nextDraft, ...snapshot.drafts.filter((item) => item.id !== draft.id)]
      }
      return structuredClone(nextDraft)
    },
    async listDrafts() {
      return structuredClone(snapshot.drafts)
    }
  }
}

export function createBrowserCockpitRepository(storageKey = 'pv-mind-cockpit'): CockpitRepository {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createMockCockpitRepository()
  }

  const readSnapshot = () => {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? (JSON.parse(raw) as DashboardSnapshot) : createMockSnapshot()
  }

  const writeSnapshot = (snapshot: DashboardSnapshot) => {
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot))
  }

  return {
    async getDashboardSnapshot() {
      const snapshot = readSnapshot()
      writeSnapshot(snapshot)
      return snapshot
    },
    async saveDraft(draft) {
      const snapshot = readSnapshot()
      const nextDraft: DraftItem = {
        ...draft,
        updatedAt: draft.updatedAt ?? new Date().toISOString()
      }
      const nextSnapshot = {
        ...snapshot,
        drafts: [nextDraft, ...snapshot.drafts.filter((item) => item.id !== draft.id)]
      }
      writeSnapshot(nextSnapshot)
      return nextDraft
    },
    async listDrafts() {
      return readSnapshot().drafts
    }
  }
}

export function createMockStorageAdapter(): ReportStorageAdapter {
  return {
    async uploadReport(fileName, content) {
      const key = `local/${Date.now()}-${fileName}`
      return {
        key,
        publicUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`
      }
    }
  }
}

export function createSupabaseCockpitRepository(client: SupabaseClient): CockpitRepository {
  return {
    async getDashboardSnapshot() {
      const [{ data: projects }, { data: drafts }, { data: recommendations }, { data: capex }, { data: yieldSeries }] = await Promise.all([
        client.from('projects').select('id,name,location,capacity_mw,bess_mwh,performance_ratio,status,updated_at').order('updated_at', { ascending: false }),
        client.from('drafts').select('id,title,content,updated_at,synced').order('updated_at', { ascending: false }),
        client.from('recommendations').select('id,title,detail,severity').order('created_at', { ascending: false }),
        client.from('capex_items').select('category,amount_usd').order('amount_usd', { ascending: false }),
        client.from('yield_series').select('month,yield_mwh,irradiance').order('sort_order', { ascending: true })
      ])

      return {
        projects: (projects ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          location: item.location,
          capacityMw: item.capacity_mw,
          bessMwh: item.bess_mwh,
          performanceRatio: item.performance_ratio,
          status: item.status,
          updatedAt: item.updated_at
        })),
        drafts: (drafts ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          updatedAt: item.updated_at,
          synced: item.synced
        })),
        recommendations: (recommendations ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          detail: item.detail,
          severity: item.severity
        })),
        capexBreakdown: (capex ?? []).map((item) => ({
          category: item.category,
          amountUsd: item.amount_usd
        })),
        yieldSeries: (yieldSeries ?? []).map((item) => ({
          month: item.month,
          yieldMwh: item.yield_mwh,
          irradiance: item.irradiance
        }))
      }
    },
    async saveDraft(draft) {
      const payload = {
        id: draft.id,
        title: draft.title,
        content: draft.content,
        updated_at: draft.updatedAt ?? new Date().toISOString(),
        synced: draft.synced
      }
      const { data, error } = await client.from('drafts').upsert(payload).select('id,title,content,updated_at,synced').single()
      if (error) {
        throw error
      }
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        updatedAt: data.updated_at,
        synced: data.synced
      }
    },
    async listDrafts() {
      const { data, error } = await client.from('drafts').select('id,title,content,updated_at,synced').order('updated_at', { ascending: false })
      if (error) {
        throw error
      }
      return (data ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        updatedAt: item.updated_at,
        synced: item.synced
      }))
    }
  }
}

export function createSupabaseStorageAdapter(client: SupabaseClient, bucket = 'reports'): ReportStorageAdapter {
  return {
    async uploadReport(fileName, content) {
      const key = `reports/${Date.now()}-${fileName}`
      const { error } = await client.storage.from(bucket).upload(key, new Blob([content], { type: 'text/plain;charset=utf-8' }), {
        upsert: true
      })
      if (error) {
        throw error
      }
      const { data } = client.storage.from(bucket).getPublicUrl(key)
      return {
        key,
        publicUrl: data.publicUrl
      }
    }
  }
}
