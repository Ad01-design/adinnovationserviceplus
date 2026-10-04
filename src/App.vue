<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ToastHost from '@/components/ToastHost.vue'
import PwaBar from '@/components/PwaBar.vue'
import CallButton from '@/components/CallButton.vue'
import { useSettings } from '@/composables/useSettings'
import { useAuth } from '@/composables/useAuth'
import { initPwa } from '@/lib/pwa'

const route = useRoute()
const { load: loadSettings } = useSettings()
const { init: initAuth } = useAuth()

const showChrome = computed(() => !route.meta.hideChrome)

onMounted(() => {
  loadSettings()
  initAuth()
  initPwa()
})
</script>

<template>
  <div class="app-shell">
    <AppHeader v-if="showChrome" />

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <AppFooter v-if="showChrome" />
    <CallButton v-if="showChrome" />
    <PwaBar />
    <ToastHost />
  </div>
</template>