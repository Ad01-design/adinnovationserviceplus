<script setup>
import { computed, ref } from 'vue'
import { useI18n } from '@/i18n'
import { canInstall, dismissInstall, installed, isIosSafari, promptInstall } from '@/lib/pwa'

const { t } = useI18n()
const dismissed = ref(false)

/* Rien à proposer si l'app est déjà installée, ou si l'utilisateur a fermé la carte. */
const visible = computed(
  () => !dismissed.value && !installed.value && (canInstall.value || isIosSafari.value),
)

async function install() {
  /* Si l'utilisateur refuse, canInstall retombe à false et la carte disparaît d'elle-même. */
  await promptInstall()
}

function close() {
  /* Sur Chrome/Android on mémorise un délai de 7 jours ; sur iOS la fermeture vaut pour la visite. */
  if (canInstall.value) dismissInstall()
  dismissed.value = true
}
</script>

<template>
  <Transition name="pwa">
    <div v-if="visible" class="pwa-install" role="region" :aria-label="t('pwa.installTitle')">
      <span class="pwa-install__icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="7" y="2.5" width="10.5" height="19" rx="2.6" />
          <path d="M12.25 8.2v6.1" />
          <path d="M9.7 11.6l2.55 2.7 2.55-2.7" />
        </svg>
      </span>

      <div class="pwa-install__text">
        <strong>{{ t('pwa.installTitle') }}</strong>
        <p>{{ canInstall ? t('pwa.installText') : t('pwa.iosHint') }}</p>
      </div>

      <button v-if="canInstall" class="pwa-install__cta" type="button" @click="install">
        {{ t('pwa.install') }}
      </button>

      <button
        class="pwa-install__close"
        type="button"
        :aria-label="t('common.close')"
        @click="close"
      >
        ✕
      </button>
    </div>
  </Transition>
</template>
