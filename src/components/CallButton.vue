<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useSettings } from '@/composables/useSettings'
import { online } from '@/lib/pwa'
import { useI18n } from '@/i18n'
import { telLink } from '@/lib/utils'

const POS_KEY = 'ao.callfab.pos'
const THRESHOLD = 6
const MARGIN = 10

const { settings } = useSettings()
const { t } = useI18n()

const el = ref(null)
const pos = ref(null)
const dragging = ref(false)

const phone = computed(() => settings.value.phone1 || settings.value.phone2 || '')

/* La barre « hors ligne » occupe le bas de l'écran sur mobile : le bouton se
   décale vers le haut tant qu'il n'a pas été déplacé à la main. */
const barVisible = computed(() => !online.value)

/* Position choisie par l'utilisateur, sinon le coin en bas à droite du CSS. */
const style = computed(() =>
  pos.value
    ? { left: `${pos.value.x}px`, top: `${pos.value.y}px`, right: 'auto', bottom: 'auto' }
    : null,
)

let pointerId = null
let startX = 0
let startY = 0
let originX = 0
let originY = 0
let moved = false
let suppressClick = false

function clamp(x, y) {
  const size = el.value?.offsetWidth || 58
  const maxX = Math.max(MARGIN, window.innerWidth - size - MARGIN)
  const maxY = Math.max(MARGIN, window.innerHeight - size - MARGIN)
  return {
    x: Math.min(Math.max(MARGIN, x), maxX),
    y: Math.min(Math.max(MARGIN, y), maxY),
  }
}

function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(POS_KEY) || 'null')
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) return saved
  } catch {
    /* stockage indisponible ou valeur corrompue : on garde la position par défaut */
  }
  return null
}

function save() {
  try {
    if (pos.value) localStorage.setItem(POS_KEY, JSON.stringify(pos.value))
  } catch {
    /* stockage indisponible : le bouton reste juste non mémorisé */
  }
}

function applyClamped() {
  if (pos.value) pos.value = clamp(pos.value.x, pos.value.y)
}

function onPointerDown(event) {
  if (!el.value) return
  if (event.pointerType === 'mouse' && event.button !== 0) return

  const rect = el.value.getBoundingClientRect()
  originX = rect.left
  originY = rect.top
  startX = event.clientX
  startY = event.clientY
  moved = false
  dragging.value = true
  pointerId = event.pointerId
  el.value.setPointerCapture?.(event.pointerId)
}

function onPointerMove(event) {
  if (!dragging.value) return

  const dx = event.clientX - startX
  const dy = event.clientY - startY
  // En dessous du seuil on considère que c'est un appui, pas un glissement.
  if (!moved && Math.abs(dx) + Math.abs(dy) < THRESHOLD) return

  moved = true
  pos.value = clamp(originX + dx, originY + dy)
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false

  if (pointerId !== null) {
    el.value?.releasePointerCapture?.(pointerId)
    pointerId = null
  }

  // Simple appui : on laisse le <a> déclencher l'appel.
  if (!moved) return

  // Après un glissement, on annule le clic qui suit.
  suppressClick = true

  // Aimanté sur le bord le plus proche, comme les bulles d'assistance.
  const size = el.value?.offsetWidth || 58
  const toLeft = pos.value.x + size / 2 < window.innerWidth / 2
  pos.value = clamp(toLeft ? MARGIN : window.innerWidth - size - MARGIN, pos.value.y)
  save()
}

function onClick(event) {
  if (!suppressClick) return
  suppressClick = false
  event.preventDefault()
}

onMounted(() => {
  const saved = readSaved()
  if (saved) pos.value = clamp(saved.x, saved.y)
  window.addEventListener('resize', applyClamped)
  window.addEventListener('orientationchange', applyClamped)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', applyClamped)
  window.removeEventListener('orientationchange', applyClamped)
})
</script>

<template>
  <a
    v-if="phone"
    ref="el"
    class="call-fab"
    :class="{ 'is-dragging': dragging, 'call-fab--raised': barVisible && !pos }"
    :style="style"
    :href="telLink(phone)"
    :aria-label="`${t('nav.callNow')} — ${phone}`"
    :title="t('nav.callHint')"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @click="onClick"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1A17 17 0 0 1 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.2 2.2z"
      />
    </svg>
  </a>
</template>
