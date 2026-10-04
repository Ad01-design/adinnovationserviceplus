/* ==========================================================================
   Service worker — AD INNOVATION SERVICES PLUS
   Version à la main (≈2 Ko) : pas de bibliothèque, tout est pensé pour les
   connexions lentes et intermittentes.
   --------------------------------------------------------------------------
   Stratégies :
   - Pages (navigation) : réseau d'abord, repli sur la copie en cache -> l'app
     reste ouvrable hors ligne.
   - Fichiers du site (JS, CSS, images, icônes...) : cache d'abord avec
     revalidation en arrière-plan -> ouverture quasi instantanée, quasiment
     aucune donnée re-téléchargée à chaque visite.
   - Les appels à Supabase et tout ce qui n'est pas en GET passent sans cache.
   ========================================================================== */

const VERSION = 'ao-v2'
const SHELL_CACHE = `${VERSION}-shell`
const ASSET_CACHE = `${VERSION}-assets`
const base = new URL(self.registration.scope)
const assetUrl = (path) => new URL(path, base).href

const SHELL = [
  assetUrl('index.html'),
  assetUrl('manifest.webmanifest'),
  assetUrl('icons/favicon-48.png'),
  assetUrl('icons/icon-192.jpg'),
  assetUrl('icons/icon-512.jpg'),
].map((item) => new Request(item, { cache: 'reload' }))

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE)
      // On met en cache un par un : un fichier manquant ne fait pas échouer l'install.
      await Promise.all(SHELL.map((request) => cache.add(request).catch(() => null)))
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

async function serveNavigation(request) {
  const cache = await caches.open(SHELL_CACHE)
  try {
    const response = await fetch(request)
    if (response && response.ok) cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return (await cache.match(assetUrl('index.html'))) || Response.error()
  }
}

async function serveAsset(request) {
  const cache = await caches.open(ASSET_CACHE)
  const cached = await cache.match(request)

  const refresh = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => null)

  if (cached) {
    // Cache d'abord : affichage immédiat, puis mise à jour en arrière-plan pour
    // la prochaine visite. En « économie de données » on n'anticipe pas.
    if (!navigator.connection?.saveData) refresh
    return cached
  }

  const response = await refresh
  if (response) return response
  throw new Error('Ressource indisponible hors ligne')
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const target = new URL(request.url)
  // On ne met jamais en cache l'API Supabase ni les ressources tierces.
  if (target.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(serveNavigation(request))
    return
  }

  const cacheable =
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'manifest' ||
    /\.(?:js|css|png|svg|woff2?)$/.test(target.pathname)

  if (cacheable) event.respondWith(serveAsset(request))
})