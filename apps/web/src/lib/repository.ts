import { createBrowserCockpitRepository, createSupabaseBrowserClient, createSupabaseCockpitRepository } from '@pv-mind/core'

const client = createSupabaseBrowserClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
})

export const repository = client ? createSupabaseCockpitRepository(client) : createBrowserCockpitRepository()
