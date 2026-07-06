import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, BatteryCharging, FileDown, Gauge, SunMedium } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { DraftItem, ProjectStatus } from '@pv-mind/core'

import { IntentBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { repository } from '@/lib/repository'
import { formatCurrency } from '@/lib/utils'
import { useDashboardFilters } from '@/store/filters'

const queryKey = ['dashboard']

const statusOptions: Array<ProjectStatus | 'all'> = ['all', 'active', 'review', 'draft']

export default function App() {
  const queryClient = useQueryClient()
  const status = useDashboardFilters((state) => state.status)
  const setStatus = useDashboardFilters((state) => state.setStatus)

  const dashboardQuery = useQuery({
    queryKey,
    queryFn: () => repository.getDashboardSnapshot()
  })

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      const draft: DraftItem = {
        id: crypto.randomUUID(),
        title: 'Operator handoff note',
        content: 'Capture revised transformer loading assumptions before the procurement review.',
        updatedAt: new Date().toISOString(),
        synced: false
      }
      return repository.saveDraft(draft)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey })
    }
  })

  const dashboard = dashboardQuery.data

  const filteredProjects = useMemo(() => {
    if (!dashboard) {
      return []
    }

    return status === 'all' ? dashboard.projects : dashboard.projects.filter((project) => project.status === status)
  }, [dashboard, status])

  const totalCapacity = filteredProjects.reduce((sum, project) => sum + project.capacityMw, 0)
  const totalBess = filteredProjects.reduce((sum, project) => sum + project.bessMwh, 0)
  const averagePr = filteredProjects.length
    ? filteredProjects.reduce((sum, project) => sum + project.performanceRatio, 0) / filteredProjects.length
    : 0
  const totalCapex = dashboard?.capexBreakdown.reduce((sum, item) => sum + item.amountUsd, 0) ?? 0

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <IntentBadge intent="active">Local mock mode by default</IntentBadge>
            <h1 className="text-4xl font-semibold tracking-tight">PV Mind Cockpit</h1>
            <p className="max-w-3xl text-sm text-slate-400 sm:text-base">
              Cross-platform cockpit scaffold for solar PV and BESS delivery teams with Supabase-ready adapters and offline-safe draft handling.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {statusOptions.map((option) => (
              <Button key={option} variant={status === option ? 'default' : 'outline'} size="sm" onClick={() => setStatus(option)}>
                {option}
              </Button>
            ))}
            <Button onClick={() => saveDraftMutation.mutate()}>
              <FileDown className="mr-2 h-4 w-4" />
              Save local draft
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={SunMedium} label="Filtered PV capacity" value={`${totalCapacity.toFixed(0)} MW`} detail="Across the visible project portfolio" />
          <MetricCard icon={BatteryCharging} label="Filtered BESS size" value={`${totalBess.toFixed(0)} MWh`} detail="Available for dispatch planning" />
          <MetricCard icon={Gauge} label="Average performance ratio" value={`${(averagePr * 100).toFixed(1)}%`} detail="Portfolio health snapshot" />
          <MetricCard icon={Activity} label="Visible CAPEX" value={formatCurrency(totalCapex)} detail="Mock breakdown for budgeting flows" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Monthly yield and irradiance</CardTitle>
              <CardDescription>Recharts line view backed by the shared repository layer.</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboard?.yieldSeries ?? []}>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis yAxisId="yield" stroke="#94a3b8" />
                  <YAxis yAxisId="irradiance" orientation="right" stroke="#38bdf8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.2)' }} />
                  <Line yAxisId="yield" type="monotone" dataKey="yieldMwh" stroke="#10b981" strokeWidth={3} dot={false} />
                  <Line yAxisId="irradiance" type="monotone" dataKey="irradiance" stroke="#38bdf8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CAPEX composition</CardTitle>
              <CardDescription>Mock budget categories ready for Supabase persistence.</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard?.capexBreakdown ?? []} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" hide />
                  <YAxis type="category" dataKey="category" width={84} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                  />
                  <Bar dataKey="amountUsd" fill="#10b981" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Project portfolio</CardTitle>
              <CardDescription>Filtered via Zustand and ready for auth-backed views once Supabase credentials are supplied.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {filteredProjects.map((project) => (
                <div key={project.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-base font-semibold text-white">{project.name}</h2>
                        <IntentBadge intent={project.status}>{project.status}</IntentBadge>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{project.location}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-right text-sm">
                      <Stat label="PV" value={`${project.capacityMw} MW`} />
                      <Stat label="BESS" value={`${project.bessMwh} MWh`} />
                      <Stat label="PR" value={`${(project.performanceRatio * 100).toFixed(0)}%`} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations & drafts</CardTitle>
              <CardDescription>Local draft saves immediately, then can be swapped to Supabase sync later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboard?.recommendations.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <IntentBadge intent={item.severity}>{item.severity}</IntentBadge>
                  </div>
                  <p className="text-sm text-slate-400">{item.detail}</p>
                </div>
              ))}
              <div className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Offline-safe drafts</p>
                <p className="mt-1 text-slate-400">{dashboard?.drafts.length ?? 0} draft items are currently available in the local repository.</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof SunMedium; label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{label}</CardTitle>
        <Icon className="h-4 w-4 text-emerald-300" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-white">{value}</div>
        <p className="mt-1 text-xs text-slate-400">{detail}</p>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-medium text-white">{value}</p>
    </div>
  )
}
