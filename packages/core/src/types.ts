export type ProjectStatus = 'draft' | 'review' | 'active'
export type RecommendationSeverity = 'low' | 'medium' | 'high'

export interface ProjectSummary {
  id: string
  name: string
  location: string
  capacityMw: number
  bessMwh: number
  performanceRatio: number
  status: ProjectStatus
  updatedAt: string
}

export interface YieldPoint {
  month: string
  yieldMwh: number
  irradiance: number
}

export interface CapexItem {
  category: string
  amountUsd: number
}

export interface Recommendation {
  id: string
  title: string
  detail: string
  severity: RecommendationSeverity
}

export interface DraftItem {
  id: string
  title: string
  content: string
  updatedAt: string
  synced: boolean
}

export interface DashboardSnapshot {
  projects: ProjectSummary[]
  yieldSeries: YieldPoint[]
  capexBreakdown: CapexItem[]
  recommendations: Recommendation[]
  drafts: DraftItem[]
}

export interface StorageUpload {
  key: string
  publicUrl: string
}
