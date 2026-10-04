<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from '@/i18n'
import { APP_SHORT_NAME } from '@/lib/brandDefaults'
import { canInstall, installed, isIosSafari, promptInstall } from '@/lib/pwa'

/* `dropdown` : icône dans la barre de navigation. `inline` : rangée pleine
   largeur dans le tiroir mobile, où un menu ancré serait coupé. */
const props = defineProps({
  variant: { type: String, default: 'dropdown' },
})

const { t } = useI18n()
const open = ref(false)
const root = ref(null)

const inline = computed(() => props.variant === 'inline')
const title = computed(() => t('pwa.installTitle', { app: APP_SHORT_NAME }))

/**
 * Rien à proposer une fois l'app installée : le bouton disparaît dès que le
 * site tourne en mode autonome ou que l'événement `appinstalled` est reçu.
 */
const visible = computed(() => !installed.value)

async function install() {
  /* Sans événement `beforeinstallprompt` (navigateur non compatible, ou serveur
     de dev où le service worker n'est pas enregistré) il n'y a rien à ouvrir. */
  if (!canInstall.value) return
  await promptInstall()
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function onDocumentClick(event) {
  if (!root.value?.contains(event.target)) open.value = false
}

function onKeydown(event) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div v-if="visible" ref="root" class="pwa-menu" :class="`pwa-menu--${variant}`">
    <button
      class="pwa-menu__btn"
      type="button"
      aria-haspopup="true"
      :aria-expanded="open"
      :aria-label="t('pwa.menuLabel')"
      @click="toggle"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3.6v11.2" />
        <path d="M7.9 10.5 12 14.6l4.1-4.1" />
        <path d="M4.6 19.4h14.8" />
      </svg>
      <span class="pwa-menu__btn-label">{{ t('pwa.download') }}</span>
    </button>

    <Transition name="pop">
      <div v-if="open" class="pwa-menu__panel" role="menu" :aria-label="title">
        <strong>{{ title }}</strong>
        <p>{{ t('pwa.installText') }}</p>
        <!-- iOS n'a jamais d'invite native : on garde seulement la marche à suivre. -->
        <p v-if="isIosSafari" class="pwa-menu__hint">{{ t('pwa.iosHint') }}</p>

        <button class="pwa-menu__cta" type="button" @click="install">
          {{ t('pwa.install') }}
        </button>
      </div>
    </Transition>
  </div>
</template>
