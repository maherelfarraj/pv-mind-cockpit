import { Link } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { repository } from '@/repository'
import { listQueuedDrafts } from '@/queue'

export default function HomeScreen() {
  const dashboardQuery = useQuery({
    queryKey: ['mobile-dashboard'],
    queryFn: () => repository.getDashboardSnapshot()
  })

  const queueQuery = useQuery({
    queryKey: ['queued-drafts'],
    queryFn: listQueuedDrafts
  })

  const dashboard = dashboardQuery.data
  const projects = dashboard?.projects ?? []
  const totalCapacity = projects.reduce((sum, project) => sum + project.capacityMw, 0)

  return (
    <ScrollView className="flex-1 bg-slate-950 px-5 py-6">
      <View className="mb-6 gap-2">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-emerald-300">Field cockpit</Text>
        <Text className="text-3xl font-semibold text-slate-50">PV Mind Mobile</Text>
        <Text className="text-sm leading-6 text-slate-400">Expo Router and NativeWind scaffold with SecureStore-backed draft queue and shared repository access.</Text>
      </View>

      <View className="mb-6 flex-row gap-3">
        <Metric label="Projects" value={String(projects.length)} />
        <Metric label="PV MW" value={String(totalCapacity)} />
        <Metric label="Queued" value={String(queueQuery.data?.length ?? 0)} />
      </View>

      <View className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <Text className="mb-3 text-base font-semibold text-slate-50">Priority recommendations</Text>
        {dashboard?.recommendations.map((recommendation) => (
          <View key={recommendation.id} className="mb-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <View className="mb-2 flex-row items-center justify-between gap-3">
              <Text className="flex-1 text-sm font-semibold text-slate-50">{recommendation.title}</Text>
              <Text className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs uppercase text-emerald-200">{recommendation.severity}</Text>
            </View>
            <Text className="text-sm leading-5 text-slate-400">{recommendation.detail}</Text>
          </View>
        ))}
      </View>

      <Link href="/drafts" asChild>
        <Pressable className="rounded-2xl bg-emerald-500 px-4 py-4">
          <Text className="text-center text-sm font-semibold text-slate-950">Manage offline draft queue</Text>
        </Pressable>
      </Link>
    </ScrollView>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-4">
      <Text className="text-xs uppercase tracking-wide text-slate-500">{label}</Text>
      <Text className="mt-2 text-2xl font-semibold text-slate-50">{value}</Text>
    </View>
  )
}
