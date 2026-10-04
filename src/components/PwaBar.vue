<script setup>
import { useI18n } from '@/i18n'
import { online } from '@/lib/pwa'

const { t } = useI18n()
</script>

<template>
  <div class="pwa-host">
    <Transition name="pwa">
      <!-- L'invitation à installer vit dans le hero : voir PwaInstallCard.vue. -->
      <div v-if="!online" class="pwa-bar pwa-bar--warn" role="status">
        <span aria-hidden="true">📴</span>
        <p>{{ t('pwa.offline') }}</p>
      </div>
    </Transition>
  </div>
</template>
