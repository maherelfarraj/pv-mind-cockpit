import { createMockCockpitRepository, createSupabaseBrowserClient, createSupabaseCockpitRepository } from '@pv-mind/core'

const client = createSupabaseBrowserClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
})

export const repository = client ? createSupabaseCockpitRepository(client) : createMockCockpitRepository()
