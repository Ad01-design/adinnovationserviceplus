/**
 * Client Supabase.
 *
 * Testé des deux côtés avec la config du projet :
 * - import statique : tree-shaking efficace, ≈ 9 Ko dans le bundle initial ;
 * - import dynamique (`await import('@supabase/supabase-js')`) : le namespace
 *   complet part dans un chunk séparé de 214 Ko (55 Ko gzip) téléchargé à la
 *   première requête.
 * On garde donc l'import statique, qui est le plus léger dans tous les cas.
 *
 * `getSupabase()` reste asynchrone par confort d'appel dans `api.js`.
 */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const SUPABASE_URL = url || ''
export const isSupabaseConfigured = Boolean(url && anonKey && /^https?:\/\//.test(url))

let clientPromise = null

/** Renvoie le client Supabase (promesse mémoïsée), ou `null` s'il n'est pas configuré. */
export function getSupabase() {
  if (!isSupabaseConfigured) return null
  if (!clientPromise) {
    clientPromise = Promise.resolve(
      createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }),
    )
  }
  return clientPromise
}
