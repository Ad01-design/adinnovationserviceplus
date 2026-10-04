<script setup>
import { computed, onMounted, ref } from 'vue'
import { getRealisations, getTeam, listMessages } from '@/lib/api'
import { useServices } from '@/composables/useServices'
import { messageStatusKeys, useI18n } from '@/i18n'
import { formatDate, statusTone } from '@/lib/utils'

const { services, loadAll } = useServices()
const { t, statusLabel } = useI18n()

const messages = ref([])
const teamCount = ref(0)
const realisationCount = ref(0)
const loading = ref(true)

const activeServices = computed(() => services.value.filter((s) => s.active !== false).length)
const newMessages = computed(() => messages.value.filter((m) => m.status === 'nouveau'))

/* Chaque carte renvoie vers la section concernée. */
const stats = computed(() => [
  {
    to: { name: 'admin-services' },
    icon: '🧰',
    label: t('admin.statServices'),
    value: activeServices.value,
  },
  {
    to: { name: 'admin-messages' },
    icon: '✉️',
    label: t('admin.statOpenMessages'),
    value: newMessages.value.length,
  },
  {
    to: { name: 'admin-equipe' },
    icon: '👥',
    label: t('admin.navTeam'),
    value: teamCount.value,
  },
  {
    to: { name: 'admin-realisations' },
    icon: '🏆',
    label: t('admin.navRealisations'),
    value: realisationCount.value,
  },
])

/* Répartition des messages par statut, avec une barre de progression. */
const breakdown = computed(() =>
  messageStatusKeys.map((key) => {
    const count = messages.value.filter((m) => m.status === key).length
    const total = messages.value.length || 1
    return {
      key,
      label: statusLabel('message', key),
      tone: statusTone(key),
      count,
      percent: Math.round((count / total) * 100),
    }
  }),
)

onMounted(async () => {
  try {
    // Chaque appel est isolé : un échec n'efface pas tout le tableau de bord.
    const [messageRows, teamRows, realisationRows] = await Promise.all([
      listMessages().catch(() => []),
      getTeam().catch(() => []),
      getRealisations().catch(() => []),
    ])
    messages.value = messageRows
    teamCount.value = teamRows.length
    realisationCount.value = realisationRows.length
    await loadAll()
  } catch (err) {
    console.error('[dashboard]', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="admin__topbar">
      <div>
        <h1 class="admin__title">{{ t('admin.dashboardTitle') }}</h1>
        <p class="admin__sub">{{ t('admin.dashboardSub') }}</p>
      </div>
    </div>

    <div class="stats">
      <RouterLink v-for="stat in stats" :key="stat.label" :to="stat.to" class="stat stat--link">
        <span class="stat__icon" aria-hidden="true">{{ stat.icon }}</span>
        <span class="stat__value">{{ loading ? '…' : stat.value }}</span>
        <span class="stat__label">{{ stat.label }}</span>
      </RouterLink>
    </div>

    <div class="admin-columns">
      <div class="panel">
        <div class="panel__head">
          <h3>{{ t('admin.recentMessages') }}</h3>
          <RouterLink :to="{ name: 'admin-messages' }" class="small">
            {{ t('admin.seeAll') }}
          </RouterLink>
        </div>

        <div v-if="loading" class="empty">{{ t('common.loading') }}</div>
        <div v-else-if="!messages.length" class="empty">{{ t('admin.emptyMessages') }}</div>
        <ul v-else class="admin-list">
          <li v-for="message in messages.slice(0, 5)" :key="message.id">
            <div>
              <strong>{{ message.name }}</strong>
              <span class="small muted">{{ message.phone || message.email }}</span>
            </div>
            <div class="row">
              <span class="badge" :class="`badge--${statusTone(message.status)}`">
                {{ statusLabel('message', message.status) }}
              </span>
              <span class="small muted">{{ formatDate(message.created_at, false) }}</span>
            </div>
          </li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel__head">
          <h3>{{ t('admin.messageBreakdown') }}</h3>
        </div>

        <div class="panel__body">
          <div v-if="loading" class="empty">{{ t('common.loading') }}</div>
          <div v-else-if="!messages.length" class="empty">{{ t('admin.emptyMessages') }}</div>
          <ul v-else class="breakdown">
            <li v-for="row in breakdown" :key="row.key">
              <div class="breakdown__head">
                <span class="badge" :class="`badge--${row.tone}`">{{ row.label }}</span>
                <strong>{{ row.count }}</strong>
              </div>
              <div class="breakdown__bar">
                <span
                  class="breakdown__fill"
                  :class="`breakdown__fill--${row.tone}`"
                  :style="{ width: `${row.percent}%` }"
                />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
