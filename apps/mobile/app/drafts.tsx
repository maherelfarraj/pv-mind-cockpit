import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pressable, ScrollView, Text, View } from 'react-native'

import type { DraftItem } from '@pv-mind/core'

import { repository } from '@/repository'
import { clearQueuedDrafts, enqueueDraft, listQueuedDrafts } from '@/queue'

export default function DraftsScreen() {
  const queryClient = useQueryClient()
  const queuedDraftsQuery = useQuery({
    queryKey: ['queued-drafts'],
    queryFn: listQueuedDrafts
  })

  const addDraftMutation = useMutation({
    mutationFn: async () => {
      const draft: DraftItem = {
        id: `${Date.now()}`,
        title: 'Site note',
        content: 'Upload the revised trench photo set once connectivity returns.',
        updatedAt: new Date().toISOString(),
        synced: false
      }
      await repository.saveDraft(draft)
      return enqueueDraft(draft)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['queued-drafts'] })
    }
  })

  const clearMutation = useMutation({
    mutationFn: clearQueuedDrafts,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['queued-drafts'] })
    }
  })

  return (
    <ScrollView className="flex-1 bg-slate-950 px-5 py-6">
      <View className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <Text className="text-lg font-semibold text-slate-50">Offline draft queue</Text>
        <Text className="mt-2 text-sm leading-6 text-slate-400">SecureStore keeps draft metadata available for field teams while the app is offline.</Text>
      </View>

      <View className="mb-4 flex-row gap-3">
        <Pressable className="flex-1 rounded-2xl bg-emerald-500 px-4 py-4" onPress={() => addDraftMutation.mutate()}>
          <Text className="text-center text-sm font-semibold text-slate-950">Queue sample draft</Text>
        </Pressable>
        <Pressable className="rounded-2xl border border-white/15 px-4 py-4" onPress={() => clearMutation.mutate()}>
          <Text className="text-sm font-semibold text-slate-200">Clear</Text>
        </Pressable>
      </View>

      <View className="gap-3">
        {(queuedDraftsQuery.data ?? []).map((draft) => (
          <View key={draft.id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <Text className="text-base font-semibold text-slate-50">{draft.title}</Text>
            <Text className="mt-2 text-sm leading-5 text-slate-400">{draft.content}</Text>
            <Text className="mt-3 text-xs uppercase tracking-wide text-slate-500">{draft.updatedAt}</Text>
          </View>
        ))}
        {!queuedDraftsQuery.data?.length ? (
          <View className="rounded-2xl border border-dashed border-white/15 p-5">
            <Text className="text-sm text-slate-400">No queued drafts yet.</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  )
}
