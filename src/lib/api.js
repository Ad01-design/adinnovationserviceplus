import { getSupabase } from './supabase'

/**
 * Couche d'accès aux données.
 *
 * Toutes les lectures et écritures passent par Supabase : plus aucun repli
 * sur le navigateur. Si les variables d'environnement manquent, chaque appel
 * échoue avec un message explicite au lieu d'afficher des données inventées.
 */

function unwrap({ data, error }) {
  if (error) throw new Error(error.message)
  return data
}

/**
 * Client Supabase prêt à l'emploi.
 * Lève une erreur claire si VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 * ne sont pas renseignés dans le fichier .env.
 */
async function sb() {
  const client = await getSupabase()
  if (!client) {
    throw new Error(
      "Supabase n'est pas configuré : renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans le fichier .env.",
    )
  }
  return client
}

/* ==========================================================================
 *  SERVICES
 * ========================================================================== */

export async function getServices({ includeInactive = false } = {}) {
  const client = await sb()
  let query = client.from('services').select('*').order('sort_order', { ascending: true })
  if (!includeInactive) query = query.eq('active', true)
  return unwrap(await query)
}

export async function createService(payload) {
  const client = await sb()
  return unwrap(await client.from('services').insert(payload).select().single())
}

export async function updateService(id, patch) {
  const client = await sb()
  return unwrap(await client.from('services').update(patch).eq('id', id).select().single())
}

export async function deleteService(id) {
  const client = await sb()
  unwrap(await client.from('services').delete().eq('id', id))
  return true
}

/* ==========================================================================
 *  TEAM
 * ========================================================================== */

export async function getTeam() {
  const client = await sb()
  return unwrap(
    await client.from('team').select('*').order('sort_order', { ascending: true }).eq('active', true),
  )
}

export async function getTeamAll() {
  const client = await sb()
  return unwrap(await client.from('team').select('*').order('sort_order', { ascending: true }))
}

export async function createTeamMember(payload) {
  const client = await sb()
  return unwrap(await client.from('team').insert(payload).select().single())
}

export async function updateTeamMember(id, patch) {
  const client = await sb()
  return unwrap(await client.from('team').update(patch).eq('id', id).select().single())
}

export async function deleteTeamMember(id) {
  const client = await sb()
  unwrap(await client.from('team').delete().eq('id', id))
  return true
}

/* ==========================================================================
 *  REALISATIONS
 * ========================================================================== */

export async function getRealisations() {
  const client = await sb()
  return unwrap(
    await client
      .from('realisations')
      .select('*')
      .order('created_at', { ascending: false })
      .eq('active', true),
  )
}

export async function getRealisationsAll() {
  const client = await sb()
  return unwrap(await client.from('realisations').select('*').order('created_at', { ascending: false }))
}

export async function createRealisation(payload) {
  const client = await sb()
  return unwrap(await client.from('realisations').insert(payload).select().single())
}

export async function updateRealisation(id, patch) {
  const client = await sb()
  return unwrap(await client.from('realisations').update(patch).eq('id', id).select().single())
}

export async function deleteRealisation(id) {
  const client = await sb()
  unwrap(await client.from('realisations').delete().eq('id', id))
  return true
}

/* ==========================================================================
 *  PARAMÈTRES DU SITE
 * ========================================================================== */

export async function getSettings() {
  const client = await sb()
  const rows = unwrap(await client.from('site_settings').select('key, value'))
  const settings = {}
  for (const row of rows) if (row.value !== null) settings[row.key] = row.value
  return settings
}

export async function saveSettings(patch) {
  const client = await sb()
  const rows = Object.entries(patch).map(([key, value]) => ({
    key,
    value: value ?? '',
    updated_at: new Date().toISOString(),
  }))
  unwrap(await client.from('site_settings').upsert(rows, { onConflict: 'key' }).select())
  return getSettings()
}

/* ==========================================================================
 *  MESSAGES (contact)
 * ========================================================================== */

export async function createMessage(payload) {
  const client = await sb()
  return unwrap(await client.from('messages').insert(payload).select().single())
}

export async function listMessages() {
  const client = await sb()
  return unwrap(await client.from('messages').select('*').order('created_at', { ascending: false }))
}

export async function setMessageStatus(id, status) {
  const client = await sb()
  return unwrap(await client.from('messages').update({ status }).eq('id', id).select().single())
}

export async function deleteMessage(id) {
  const client = await sb()
  unwrap(await client.from('messages').delete().eq('id', id))
  return true
}

/* ==========================================================================
 *  AUTHENTIFICATION (espace admin)
 * ========================================================================== */

export async function getSession() {
  const client = await sb()
  const { data } = await client.auth.getSession()
  return data.session ?? null
}

export async function signIn(email, password) {
  const client = await sb()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data.session
}

/**
 * Création de compte. Renvoie la session, ou `null` quand Supabase exige
 * d'abord la confirmation de l'adresse e-mail.
 */
export async function signUp(fullName, email, password) {
  const client = await sb()
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw new Error(error.message)
  return data.session ?? null
}

export async function signOut() {
  const client = await sb()
  await client.auth.signOut()
  return true
}

export function onAuthStateChange(callback) {
  let subscription = null
  let cancelled = false

  sb()
    .then((client) => {
      if (cancelled) return
      const { data } = client.auth.onAuthStateChange((_event, session) => callback(session))
      subscription = data.subscription
    })
    .catch((error) => console.error('[auth]', error))

  return {
    unsubscribe: () => {
      cancelled = true
      subscription?.unsubscribe()
    },
  }
}
