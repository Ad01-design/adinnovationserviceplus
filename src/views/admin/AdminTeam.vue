<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import ModalDialog from '@/components/ModalDialog.vue'
import { createTeamMember, deleteTeamMember, updateTeamMember } from '@/lib/api'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'

const team = ref([])
const loading = ref(false)
const { success, error } = useToast()
const { t } = useI18n()

const open = ref(false)
const saving = ref(false)
const editingId = ref(null)
const search = ref('')

const draft = reactive({
  name: '',
  role: '',
  bio: '',
  photo: '',
  active: true,
  sort_order: 100,
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return team.value
  return team.value.filter((m) =>
    `${m.name} ${m.role} ${m.bio}`.toLowerCase().includes(term),
  )
})

function resetDraft() {
  Object.assign(draft, {
    name: '',
    role: '',
    bio: '',
    photo: '',
    active: true,
    sort_order: 100,
  })
}

function openCreate() {
  editingId.value = null
  resetDraft()
  open.value = true
}

function openEdit(member) {
  editingId.value = member.id
  Object.assign(draft, {
    name: member.name ?? '',
    role: member.role ?? '',
    bio: member.bio ?? '',
    photo: member.photo ?? '',
    active: member.active !== false,
    sort_order: member.sort_order ?? 100,
  })
  open.value = true
}

async function save() {
  if (!draft.name.trim()) {
    error(t('admin.errTeamName'))
    return
  }

  saving.value = true
  const payload = {
    ...draft,
    name: draft.name.trim(),
    sort_order: Number(draft.sort_order) || 100,
  }

  try {
    if (editingId.value) {
      const updated = await updateTeamMember(editingId.value, payload)
      const index = team.value.findIndex((m) => m.id === editingId.value)
      if (index !== -1) team.value[index] = { ...team.value[index], ...payload }
      success(t('admin.toastTeamUpdated'))
    } else {
      const created = await createTeamMember(payload)
      team.value = [...team.value, created]
      success(t('admin.toastTeamCreated'))
    }
    open.value = false
    await loadAll()
  } catch (err) {
    error(err.message)
  } finally {
    saving.value = false
  }
}

async function toggleField(member, field) {
  const next = !member[field]
  try {
    const updated = await updateTeamMember(member.id, { [field]: next })
    const index = team.value.findIndex((m) => m.id === member.id)
    if (index !== -1) team.value[index] = { ...member, [field]: next }
  } catch (err) {
    error(err.message)
  }
}

async function remove(member) {
  if (!window.confirm(t('admin.teamConfirm', { name: member.name }))) return
  try {
    await deleteTeamMember(member.id)
    team.value = team.value.filter((m) => m.id !== member.id)
    success(t('admin.toastTeamDeleted'))
  } catch (err) {
    error(err.message)
  }
}

async function loadAll() {
  loading.value = true
  try {
    const { getTeamAll } = await import('@/lib/api')
    team.value = await getTeamAll()
  } catch (err) {
    error(err.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadAll())
</script>

<template>
  <div>
    <div class="admin__topbar">
      <div>
        <h1 class="admin__title">{{ t('admin.teamTitle') }}</h1>
        <p class="admin__sub">{{ t('admin.teamSub', { count: team.length }) }}</p>
      </div>
      <div class="row">
        <input
          v-model="search"
          class="input"
          type="search"
          :placeholder="t('common.search')"
          style="width: 220px"
        />
        <button class="btn btn--primary btn--sm" type="button" @click="openCreate">
          {{ t('admin.newTeam') }}
        </button>
      </div>
    </div>

    <div class="panel">
      <div v-if="loading && !team.length" class="empty">{{ t('admin.teamLoading') }}</div>
      <div v-else-if="!filtered.length" class="empty">{{ t('admin.teamEmpty') }}</div>

      <div v-else class="table-wrap">
        <table class="data">
          <thead>
            <tr>
              <th>{{ t('admin.thName') }}</th>
              <th>{{ t('admin.thRole') }}</th>
              <th>{{ t('admin.thOrder') }}</th>
              <th>{{ t('admin.thOnline') }}</th>
              <th>{{ t('admin.thActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in filtered" :key="member.id">
              <td>
                <strong>{{ member.name }}</strong>
                <div class="small muted">{{ member.bio?.slice(0, 60) }}{{ member.bio?.length > 60 ? '...' : '' }}</div>
              </td>
              <td><span class="badge">{{ member.role }}</span></td>
              <td class="small">{{ member.sort_order }}</td>
              <td>
                <label class="checkbox">
                  <input
                    type="checkbox"
                    :checked="member.active !== false"
                    @change="toggleField(member, 'active')"
                  />
                  <span class="small">
                    {{ member.active !== false ? t('common.yes') : t('common.no') }}
                  </span>
                </label>
              </td>
              <td>
                <div class="cell-actions">
                  <button class="icon-btn" type="button" @click="openEdit(member)">
                    {{ t('common.edit') }}
                  </button>
                  <button class="icon-btn icon-btn--danger" type="button" @click="remove(member)">
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
      :open="open"
      :title="editingId ? t('admin.modalEditTeam') : t('admin.modalNewTeam')"
      @close="open = false"
    >
      <form class="form" novalidate @submit.prevent="save">
        <div class="form-grid">
          <div class="field">
            <label for="t-name">{{ t('admin.fieldName') }} *</label>
            <input id="t-name" v-model="draft.name" class="input" type="text" />
          </div>
          <div class="field">
            <label for="t-role">{{ t('admin.fieldRole') }}</label>
            <input id="t-role" v-model="draft.role" class="input" type="text" />
          </div>
        </div>

        <div class="field">
          <label for="t-photo">{{ t('admin.fieldPhoto') }}</label>
          <input id="t-photo" v-model="draft.photo" class="input" type="text" :placeholder="t('admin.fieldPhotoPlaceholder')" />
        </div>

        <div class="field">
          <label for="t-bio">{{ t('admin.fieldBio') }}</label>
          <textarea id="t-bio" v-model="draft.bio" class="textarea" rows="3" />
        </div>

        <div class="form-grid">
          <div class="field">
            <label for="t-order">{{ t('admin.fieldOrder') }}</label>
            <input id="t-order" v-model="draft.sort_order" class="input" type="number" min="1" />
          </div>
        </div>

        <div class="row">
          <label class="checkbox">
            <input v-model="draft.active" type="checkbox" />
            {{ t('admin.fieldVisible') }}
          </label>
        </div>
      </form>

      <template #footer>
        <button class="btn btn--outline btn--sm" type="button" @click="open = false">
          {{ t('common.cancel') }}
        </button>
        <button class="btn btn--primary btn--sm" type="button" :disabled="saving" @click="save">
          {{ saving ? t('common.saving') : t('common.save') }}
        </button>
      </template>
    </ModalDialog>
  </div>
</template>