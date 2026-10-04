/**
 * Installation (PWA) + état de connexion.
 *
 * - Enregistre le service worker après le chargement, pour ne pas concurrencer
 *   les ressources critiques sur une connexion lente.
 * - Capture l'événement d'installation d'Android/Chrome pour proposer l'entrée
 *   « Télécharger » du menu de navigation.
 * - Sur iOS Safari cet événement n'existe pas : on affiche la marche à suivre.
 */
import { computed, ref } from 'vue'

export const online = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
export const canInstall = ref(false)
export const installed = ref(false)

/**
 * Aperçu du menu d'installation pour le design : `?installCard=chrome`
 * (menu avec bouton d'installation) ou `?installCard=ios` (variante iOS).
 * Sans ces paramètres, l'option ne s'active que là où le navigateur l'autorise.
 */
export const previewIos = ref(false)

let deferredPrompt = null

export function initPwa() {
  if (typeof window === 'undefined') return

  const update = () => {
    online.value = navigator.onLine
  }
  window.addEventListener('online', update)
  window.addEventListener('offline', update)

  const mode = new URLSearchParams(window.location.search).get('installCard')
  if (mode === 'chrome') canInstall.value = true
  if (mode === 'ios') previewIos.value = true

  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  installed.value = Boolean(standalone)

  window.addEventListener('appinstalled', () => {
    installed.value = true
    canInstall.value = false
    deferredPrompt = null
  })

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event
    canInstall.value = true
  })

  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* navigateur non compatible : on ignore */
      })
    })
  }
}

export const isIosSafari = computed(() => {
  if (typeof navigator === 'undefined') return false
  if (previewIos.value) return !installed.value
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !window.MSStream &&
    !installed.value
  )
})

export async function promptInstall() {
  if (!deferredPrompt) return false
  const event = deferredPrompt
  deferredPrompt = null
  canInstall.value = false
  event.prompt()
  const { outcome } = await event.userChoice
  return outcome === 'accepted'
}
