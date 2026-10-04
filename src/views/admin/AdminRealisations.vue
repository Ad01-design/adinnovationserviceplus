<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import ModalDialog from '@/components/ModalDialog.vue'
import { createRealisation, deleteRealisation, updateRealisation } from '@/lib/api'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'
import { slugify } from '@/lib/utils'

const realisations = ref([])
const loading = ref(false)
const { success, error } = useToast()
const { t } = useI18n()

const open = ref(false)
const saving = ref(false)
const editingId = ref(null)
const search = ref('')

const draft = reactive({
  title: '',
  description: '',
  image: '',
  category: '',
  active: true,
  featured: false,
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return realisations.value
  return realisations.value.filter((r) =>
    `${r.title} ${r.category} ${r.description}`.toLowerCase().includes(term),
  )
})

function resetDraft() {
  Object.assign(draft, {
    title: '',
    description: '',
    image: '',
    category: '',
    active: true,
    featured: false,
  })
}

function openCreate() {
  editingId.value = null
  resetDraft()
  open.value = true
}

function openEdit(realisation) {
  editingId.value = realisation.id
  Object.assign(draft, {
    title: realisation.title ?? '',
    description: realisation.description ?? '',
    image: realisation.image ?? '',
    category: realisation.category ?? '',
    active: realisation.active !== false,
    featured: Boolean(realisation.featured),
  })
  open.value = true
}

async function save() {
  if (!draft.title.trim()) {
    error(t('admin.errRealisationTitle'))
    return
  }

  saving.value = true
  const payload = {
    ...draft,
    title: draft.title.trim(),
    slug: draft.title.trim() ? slugify(draft.title) : '',
  }

  try {
    if (editingId.value) {
      const updated = await updateRealisation(editingId.value, payload)
      const index = realisations.value.findIndex((r) => r.id === editingId.value)
      if (index !== -1) realisations.value[index] = { ...realisations.value[index], ...payload }
      success(t('admin.toastRealisationUpdated'))
    } else {
      const created = await createRealisation(payload)
      realisations.value = [created, ...realisations.value]
      success(t('admin.toastRealisationCreated'))
    }
    open.value = false
    await loadAll()
  } catch (err) {
    error(err.message)
  } finally {
    saving.value = false
  }
}

async function toggleField(realisation, field) {
  const next = !realisation[field]
  try {
    const updated = await updateRealisation(realisation.id, { [field]: next })
    const index = realisations.value.findIndex((r) => r.id === realisation.id)
    if (index !== -1) realisations.value[index] = { ...realisation, [field]: next }
  } catch (err) {
    error(err.message)
  }
}

async function remove(realisation) {
  if (!window.confirm(t('admin.realisationConfirm', { title: realisation.title }))) return
  try {
    await deleteRealisation(realisation.id)
    realisations.value = realisations.value.filter((r) => r.id !== realisation.id)
    success(t('admin.toastRealisationDeleted'))
  } catch (err) {
    error(err.message)
  }
}

async function loadAll() {
  loading.value = true
  try {
    const { getRealisationsAll } = await import('@/lib/api')
    realisations.value = await getRealisationsAll()
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
        <h1 class="admin__title">{{ t('admin.realisationsTitle') }}</h1>
        <p class="admin__sub">{{ t('admin.realisationsSub', { count: realisations.length }) }}</p>
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
          {{ t('admin.newRealisation') }}
        </button>
      </div>
    </div>

    <div class="panel">
      <div v-if="loading && !realisations.length" class="empty">{{ t('admin.realisationsLoading') }}</div>
      <div v-else-if="!filtered.length" class="empty">{{ t('admin.realisationsEmpty') }}</div>

      <div v-else class="table-wrap">
        <table class="data">
          <thead>
            <tr>
              <th>{{ t('admin.thRealisation') }}</th>
              <th>{{ t('admin.thCategory') }}</th>
              <th>{{ t('admin.thOnline') }}</th>
              <th>{{ t('admin.thShowcase') }}</th>
              <th>{{ t('admin.thActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="realisation in filtered" :key="realisation.id">
              <td>
                <strong>{{ realisation.title }}</strong>
                <div class="small muted">{{ realisation.description?.slice(0, 60) }}{{ realisation.description?.length > 60 ? '...' : '' }}</div>
              </td>
              <td><span class="badge">{{ realisation.category }}</span></td>
              <td>
                <label class="checkbox">
                  <input
                    type="checkbox"
                    :checked="realisation.active !== false"
                    @change="toggleField(realisation, 'active')"
                  />
                  <span class="small">
                    {{ realisation.active !== false ? t('common.yes') : t('common.no') }}
                  </span>
                </label>
              </td>
              <td>
                <label class="checkbox">
                  <input
                    type="checkbox"
                    :checked="Boolean(realisation.featured)"
                    @change="toggleField(realisation, 'featured')"
                  />
                  <span class="small">
                    {{ realisation.featured ? t('common.yes') : t('common.no') }}
                  </span>
                </label>
              </td>
              <td>
                <div class="cell-actions">
                  <button class="icon-btn" type="button" @click="openEdit(realisation)">
                    {{ t('common.edit') }}
                  </button>
                  <button class="icon-btn icon-btn--danger" type="button" @click="remove(realisation)">
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
      :title="editingId ? t('admin.modalEditRealisation') : t('admin.modalNewRealisation')"
      @close="open = false"
    >
      <form class="form" novalidate @submit.prevent="save">
        <div class="field">
          <label for="r-title">{{ t('admin.fieldTitle') }} *</label>
          <input id="r-title" v-model="draft.title" class="input" type="text" />
        </div>

        <div class="form-grid">
          <div class="field">
            <label for="r-category">{{ t('admin.fieldCategory') }}</label>
            <input id="r-category" v-model="draft.category" class="input" type="text" />
          </div>
          <div class="field">
            <label for="r-image">{{ t('admin.fieldImage') }}</label>
            <input id="r-image" v-model="draft.image" class="input" type="text" :placeholder="t('admin.fieldImagePlaceholder')" />
          </div>
        </div>

        <div class="field">
          <label for="r-description">{{ t('admin.fieldDescription') }}</label>
          <textarea id="r-description" v-model="draft.description" class="textarea" rows="4" />
        </div>

        <div class="row">
          <label class="checkbox">
            <input v-model="draft.active" type="checkbox" />
            {{ t('admin.fieldVisible') }}
          </label>
          <label class="checkbox">
            <input v-model="draft.featured" type="checkbox" />
            {{ t('admin.fieldFeatured') }}
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