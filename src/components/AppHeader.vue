<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LangSwitcher from '@/components/LangSwitcher.vue'
import PwaMenu from '@/components/PwaMenu.vue'
import logoUrl from '@/assets/logo.jpg'
import { useAuth } from '@/composables/useAuth'
import { useSettings } from '@/composables/useSettings'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'
import { telLink } from '@/lib/utils'

const route = useRoute()
const { settings } = useSettings()
const { t } = useI18n()
const { isAuthenticated, init, logout } = useAuth()
const { success } = useToast()

const open = ref(false)
let media = null

const links = computed(() => [
  { name: 'accueil', label: t('nav.home') },
  { name: 'accueil', hash: '#services', label: t('nav.services') },
  { name: 'accueil', hash: '#equipe', label: t('nav.team') },
  { name: 'realisations', label: t('nav.realisations') },
  { name: 'accueil', hash: '#contact', label: t('nav.contact') },
])

/* Un seul lien marqué actif : on compare la route, puis le hash s'il y en a un. */
function isActive(link) {
  if (route.name !== link.name) return false
  return link.hash ? route.hash === link.hash : !route.hash
}

function close() {
  open.value = false
}

async function signOut() {
  await logout()
  close()
  success(t('nav.signedOut'))
}

function onKeydown(event) {
  if (event.key === 'Escape') close()
}

function onMediaChange(event) {
  if (!event.matches) close()
}

watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

watch(
  () => route.fullPath,
  () => close(),
)

onMounted(() => {
  init()
  media = window.matchMedia('(max-width: 900px)')
  media.addEventListener('change', onMediaChange)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  media?.removeEventListener('change', onMediaChange)
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="site-header">
    <div class="container site-header__inner">
      <RouterLink to="/" class="brand" :aria-label="settings.brand_name">
        <img class="brand-logo" :src="logoUrl" :alt="settings.brand_name" width="342" height="100" />
      </RouterLink>

      <nav class="site-nav">
        <RouterLink v-for="link in links" :key="link.name" :to="{ name: link.name, hash: link.hash }">
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="header-actions">
        <PwaMenu />

        <LangSwitcher />

        <RouterLink
          v-if="!isAuthenticated"
          :to="{ name: 'connexion' }"
          class="btn btn--outline btn--sm auth-btn"
        >
          <span aria-hidden="true">👤</span>
          <span class="auth-btn__label">{{ t('nav.signIn') }}</span>
        </RouterLink>
        <RouterLink
          v-else
          :to="{ name: 'admin-tableau-de-bord' }"
          class="btn btn--ghost btn--sm auth-btn is-connected"
        >
          <span aria-hidden="true">👤</span>
          <span class="auth-btn__label">{{ t('nav.mySpace') }}</span>
        </RouterLink>

        <button
          class="nav-toggle"
          type="button"
          :aria-expanded="open"
          aria-controls="menu-lateral"
          :aria-label="t('nav.openMenu')"
          @click="open = true"
        >
          ☰
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="drawer-fade">
        <div v-if="open" class="drawer-backdrop" @click="close" />
      </Transition>

      <Transition name="drawer-slide">
        <aside
          v-if="open"
          id="menu-lateral"
          class="nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
        >
          <div class="nav-drawer__head">
            <img
              class="nav-drawer__logo"
              :src="logoUrl"
              :alt="settings.brand_name"
              width="342"
              height="100"
            />
            <button
              class="nav-drawer__close"
              type="button"
              :aria-label="t('nav.closeMenu')"
              @click="close"
            >
              ✕
            </button>
          </div>

          <nav class="nav-drawer__links">
            <RouterLink
              v-for="link in links"
              :key="link.label"
              :to="{ name: link.name, hash: link.hash }"
              :class="{ 'is-active': isActive(link) }"
            >
              {{ link.label }}
            </RouterLink>
          </nav>

          <div class="nav-drawer__foot">
            <a class="btn btn--primary nav-drawer__action" :href="telLink(settings.phone1)">
              <span aria-hidden="true">📞</span>
              {{ settings.phone1 }}
            </a>

            <RouterLink
              v-if="!isAuthenticated"
              class="btn btn--dark nav-drawer__action"
              :to="{ name: 'connexion' }"
            >
              <span aria-hidden="true">👤</span>
              {{ t('nav.signIn') }}
            </RouterLink>
            <RouterLink
              v-else
              class="btn btn--dark nav-drawer__action"
              :to="{ name: 'admin-tableau-de-bord' }"
            >
              <span aria-hidden="true">👤</span>
              {{ t('nav.mySpace') }}
            </RouterLink>

            <button
              v-if="isAuthenticated"
              class="btn btn--danger nav-drawer__action"
              type="button"
              @click="signOut"
            >
              <span aria-hidden="true">🚪</span>
              {{ t('common.logout') }}
            </button>

            <PwaMenu variant="inline" />

            <LangSwitcher class="lang-switch--full" />

            <p class="nav-drawer__meta">{{ settings.address }}</p>
            <p class="nav-drawer__meta">{{ settings.hours }}</p>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </header>
</template>