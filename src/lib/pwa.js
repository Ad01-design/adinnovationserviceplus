/**
 * Installation (PWA) + état de connexion.
 *
 * - Enregistre le service worker après le chargement, pour ne pas concurrencer
 *   les ressources critiques sur une connexion lente.
 * - Capture l'événement d'installation d'Android/Chrome pour proposer un bouton.
 * - Sur iOS Safari cet événement n'existe pas : on affiche la marche à suivre.
 */
import { computed, ref } from 'vue'

const DISMISS_KEY = 'ao.install.dismissed'

export const online = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
export const canInstall = ref(false)
export const installed = ref(false)

let deferredPrompt = null

function readDismiss() {
  try {
    return Number(localStorage.getItem(DISMISS_KEY) || 0)
  } catch {
    return 0
  }
}

export function initPwa() {
  if (typeof window === 'undefined') return

  const update = () => {
    online.value = navigator.onLine
  }
  window.addEventListener('online', update)
  window.addEventListener('offline', update)

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
    // Sept jours de répit avant de réafficher la même invitation.
    if (Date.now() - readDismiss() > 7 * 24 * 60 * 60 * 1000) canInstall.value = true
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

export function dismissInstall() {
  canInstall.value = false
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {
    /* stockage indisponible */
  }
}
