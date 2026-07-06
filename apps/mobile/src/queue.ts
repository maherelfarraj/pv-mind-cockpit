import * as SecureStore from 'expo-secure-store'

import type { DraftItem } from '@pv-mind/core'

const storageKey = 'pv-mind-cockpit:draft-queue'

export async function listQueuedDrafts(): Promise<DraftItem[]> {
  const raw = await SecureStore.getItemAsync(storageKey)
  return raw ? (JSON.parse(raw) as DraftItem[]) : []
}

export async function enqueueDraft(draft: DraftItem) {
  const queue = await listQueuedDrafts()
  const nextQueue = [draft, ...queue.filter((item) => item.id !== draft.id)]
  await SecureStore.setItemAsync(storageKey, JSON.stringify(nextQueue))
  return nextQueue
}

export async function clearQueuedDrafts() {
  await SecureStore.deleteItemAsync(storageKey)
}
