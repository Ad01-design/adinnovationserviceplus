<script setup>
import { computed, onMounted, ref } from 'vue'
import ModalDialog from '@/components/ModalDialog.vue'
import { deleteMessage, listMessages, setMessageStatus } from '@/lib/api'
import { useToast } from '@/composables/useToast'
import { messageStatusKeys, useI18n } from '@/i18n'
import { formatDate, statusTone } from '@/lib/utils'

const { success, error } = useToast()
const { t, statusLabel } = useI18n()

const messages = ref([])
const loading = ref(true)
const filter = ref('tous')
const selected = ref(null)

const filtered = computed(() =>
  filter.value === 'tous'
    ? messages.value
    : messages.value.filter((m) => m.status === filter.value),
)

const counts = computed(() => {
  const result = { tous: messages.value.length }
  messageStatusKeys.forEach((key) => {
    result[key] = messages.value.filter((m) => m.status === key).length
  })
  return result
})

async function load() {
  loading.value = true
  try {
    messages.value = await listMessages()
  } catch (err) {
    error(err.message)
  } finally {
    loading.value = false
  }
}

async function changeStatus(message, status) {
  try {
    const updated = await setMessageStatus(message.id, status)
    const index = messages.value.findIndex((m) => m.id === message.id)
    if (index !== -1) messages.value[index] = updated || { ...message, status }
    success(t('admin.toastStatus'))
  } catch (err) {
    error(err.message)
  }
}

async function remove(message) {
  if (!window.confirm(t('admin.messageConfirm', { name: message.name }))) return
  try {
    await deleteMessage(message.id)
    messages.value = messages.value.filter((m) => m.id !== message.id)
    if (selected.value?.id === message.id) selected.value = null
    success(t('admin.toastMessageDeleted'))
  } catch (err) {
    error(err.message)
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="admin__topbar">
      <div>
        <h1 class="admin__title">{{ t('admin.messagesTitle') }}</h1>
        <p class="admin__sub">{{ t('admin.messagesSub', { count: messages.length }) }}</p>
      </div>
      <button class="btn btn--outline btn--sm" type="button" @click="load">
        {{ t('common.refresh') }}
      </button>
    </div>

    <div class="filter-bar">
      <button
        class="chip"
        :class="{ 'is-active': filter === 'tous' }"
        type="button"
        @click="filter = 'tous'"
      >
        {{ t('common.all') }} ({{ counts.tous }})
      </button>
      <button
        v-for="key in messageStatusKeys"
        :key="key"
        class="chip"
        :class="{ 'is-active': filter === key }"
        type="button"
        @click="filter = key"
      >
        {{ statusLabel('message', key) }} ({{ counts[key] }})
      </button>
    </div>

    <div class="panel">
      <div v-if="loading" class="empty">{{ t('admin.messagesLoading') }}</div>
      <div v-else-if="!filtered.length" class="empty">{{ t('admin.messagesEmptyFilter') }}</div>

      <div v-else class="table-wrap">
        <table class="data">
          <thead>
            <tr>
              <th>{{ t('admin.thReceived') }}</th>
              <th>{{ t('admin.thSender') }}</th>
              <th>{{ t('admin.thStatus') }}</th>
              <th>{{ t('admin.thActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="message in filtered" :key="message.id">
              <td class="small">{{ formatDate(message.created_at) }}</td>
              <td>
                <strong>{{ message.name }}</strong>
                <div v-if="message.phone" class="small">
                  <a :href="`tel:${message.phone}`">{{ message.phone }}</a>
                </div>
                <div v-if="message.email" class="small muted">{{ message.email }}</div>
              </td>
              <td>
                <select
                  class="select"
                  :value="message.status"
                  @change="changeStatus(message, $event.target.value)"
                >
                  <option v-for="key in messageStatusKeys" :key="key" :value="key">
                    {{ statusLabel('message', key) }}
                  </option>
                </select>
                <span class="badge" :class="`badge--${statusTone(message.status)}`">
                  {{ statusLabel('message', message.status) }}
                </span>
              </td>
              <td>
                <div class="cell-actions">
                  <button class="icon-btn" type="button" @click="selected = message">
                    {{ t('common.read') }}
                  </button>
                  <button class="icon-btn icon-btn--danger" type="button" @click="remove(message)">
                    {{ t('common.delete') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ModalDialog
      :open="Boolean(selected)"
      :title="selected ? t('admin.messageModalTitle', { name: selected.name }) : ''"
      @close="selected = null"
    >
      <div v-if="selected" class="stack">
        <div class="row">
          <span class="badge" :class="`badge--${statusTone(selected.status)}`">
            {{ statusLabel('message', selected.status) }}
          </span>
          <span class="small muted">{{ formatDate(selected.created_at) }}</span>
        </div>
        <p><strong>{{ t('admin.labelPhone') }}</strong> {{ selected.phone || '—' }}</p>
        <p><strong>{{ t('admin.labelEmail') }}</strong> {{ selected.email || '—' }}</p>
      </div>

      <template #footer>
        <a
          v-if="selected?.email"
          class="btn btn--dark btn--sm"
          :href="`mailto:${selected.email}`"
        >
          {{ t('admin.replyEmail') }}
        </a>
        <button class="btn btn--outline btn--sm" type="button" @click="selected = null">
          {{ t('common.close') }}
        </button>
      </template>
    </ModalDialog>
  </div>
</template>
