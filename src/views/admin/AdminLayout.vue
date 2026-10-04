<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '@/assets/logo.jpg'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'

const router = useRouter()
const { session, logout, init } = useAuth()
const { success } = useToast()
const { t } = useI18n()

const nav = computed(() => [
  { name: 'admin-tableau-de-bord', label: t('admin.navDashboard'), icon: '' },
  { name: 'admin-messages', label: t('admin.navMessages'), icon: '✉️' },
  { name: 'admin-equipe', label: t('admin.navTeam'), icon: '👥' },
  { name: 'admin-realisations', label: t('admin.navRealisations'), icon: '🏆' },
])

async function signOut() {
  await logout()
  success(t('login.ok'))
  router.replace({ name: 'connexion' })
}

onMounted(() => init())
</script>

<template>
  <div class="admin">
    <aside class="admin__side">
      <RouterLink to="/" class="admin__brand">
        <img class="brand-logo" :src="logoUrl" alt="AD INNOVATION SERVICES PLUS" width="342" height="100" />
      </RouterLink>

      <nav class="admin__nav">
        <RouterLink v-for="item in nav" :key="item.name" :to="{ name: item.name }">
          <span aria-hidden="true">{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="admin__side-foot">
        <span class="admin__user">{{ session?.user?.email || t('admin.session') }}</span>
        <RouterLink to="/" class="icon-btn">{{ t('common.viewSite') }}</RouterLink>
        <button class="btn btn--sm btn--light" type="button" @click="signOut">
          {{ t('common.logout') }}
        </button>
      </div>
    </aside>

    <div class="admin__main">
      <RouterView />
    </div>
  </div>
</template>