<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import ModalDialog from '@/components/ModalDialog.vue'
import { createService, deleteService, updateService } from '@/lib/api'
import { useServices } from '@/composables/useServices'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'
import { SERVICE_CATEGORIES } from '@/lib/serviceCategories'
import { slugify } from '@/lib/utils'

const { services, loading, loadAll } = useServices()
const { success, error } = useToast()
const { t } = useI18n()

const open = ref(false)
const saving = ref(false)
const editingId = ref(null)
const search = ref('')

const draft = reactive({
  title: '',
  slug: '',
  category: SERVICE_CATEGORIES[0],
  icon: '✨',
  description: '',
  price_from: 'Sur devis',
  featured: false,
  active: true,
  sort_order: 100,
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return services.value
  return services.value.filter((service) =>
    `${service.title} ${service.category} ${service.description}`.toLowerCase().includes(term),
  )
})

function resetDraft() {
  Object.assign(draft, {
    title: '',
    slug: '',
    category: SERVICE_CATEGORIES[0],
    icon: '✨',
    description: '',
    price_from: 'Sur devis',
    featured: false,
    active: true,
    sort_order: 100,
  })
}

function openCreate() {
  editingId.value = null
  resetDraft()
  open.value = true
}

function openEdit(service) {
  editingId.value = service.id
  Object.assign(draft, {
    title: service.title ?? '',
    slug: service.slug ?? '',
    category: service.category ?? SERVICE_CATEGORIES[0],
    icon: service.icon ?? '✨',
    description: service.description ?? '',
    price_from: service.price_from ?? 'Sur devis',
    featured: Boolean(service.featured),
    active: service.active !== false,
    sort_order: service.sort_order ?? 100,
  })
  open.value = true
}

async function save() {
  if (!draft.title.trim()) {
    error(t('admin.errServiceTitle'))
    return
  }

  saving.value = true
  const payload = {
    ...draft,
    title: draft.title.trim(),
    slug: draft.slug.trim() || slugify(draft.title),
    sort_order: Number(draft.sort_order) || 100,
  }

  try {
    if (editingId.value) {
      const updated = await updateService(editingId.value, payload)
      const index = services.value.findIndex((s) => s.id === editingId.value)
      if (index !== -1) services.value[index] = updated || { ...services.value[index], ...payload }
      success(t('admin.toastServiceUpdated'))
    } else {
      const created = await createService(payload)
      services.value = [...services.value, created]
      success(t('admin.toastServiceCreated'))
    }
    open.value = false
    await loadAll()
  } catch (err) {
    error(err.message)
  } finally {
    saving.value = false
  }
}

async function toggleField(service, field) {
  const next = !service[field]
  try {
    const updated = await updateService(service.id, { [field]: next })
    const index = services.value.findIndex((s) => s.id === service.id)
    if (index !== -1) services.value[index] = updated || { ...service, [field]: next }
  } catch (err) {
    error(err.message)
  }
}

async function remove(service) {
  if (!window.confirm(t('admin.serviceConfirm', { title: service.title }))) return
  try {
    await deleteService(service.id)
    services.value = services.value.filter((s) => s.id !== service.id)
    success(t('admin.toastServiceDeleted'))
  } catch (err) {
    error(err.message)
  }
}

onMounted(() => loadAll())
</script>

<template>
  <div>
    <div class="admin__topbar">
      <div>
        <h1 class="admin__title">{{ t('admin.servicesTitle') }}</h1>
        <p class="admin__sub">{{ t('admin.servicesSub', { count: services.length }) }}</p>
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
          {{ t('admin.newService') }}
        </button>
      </div>
    </div>

    <div class="panel">
      <div v-if="loading && !services.length" class="empty">{{ t('admin.servicesLoading') }}</div>
      <div v-else-if="!filtered.length" class="empty">{{ t('admin.servicesEmpty') }}</div>

      <div v-else class="table-wrap">
        <table class="data">
          <thead>
            <tr>
              <th>{{ t('admin.thService') }}</th>
              <th>{{ t('admin.thCategory') }}</th>
              <th>{{ t('admin.thOrder') }}</th>
              <th>{{ t('admin.thOnline') }}</th>
              <th>{{ t('admin.thShowcase') }}</th>
              <th>{{ t('admin.thActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in filtered" :key="service.id">
              <td>
                <strong>{{ service.icon }} {{ service.title }}</strong>
                <div class="small muted">/{{ service.slug }}</div>
              </td>
              <td><span class="badge">{{ service.category }}</span></td>
              <td class="small">{{ service.sort_order }}</td>
              <td>
                <label class="checkbox">
                  <input
                    type="checkbox"
                    :checked="service.active !== false"
                    @change="toggleField(service, 'active')"
                  />
                  <span class="small">
                    {{ service.active !== false ? t('common.yes') : t('common.no') }}
                  </span>
                </label>
              </td>
              <td>
                <label class="checkbox">
                  <input
                    type="checkbox"
                    :checked="Boolean(service.featured)"
                    @change="toggleField(service, 'featured')"
                  />
                  <span class="small">
                    {{ service.featured ? t('common.yes') : t('common.no') }}
                  </span>
                </label>
              </td>
              <td>
                <div class="cell-actions">
                  <button class="icon-btn" type="button" @click="openEdit(service)">
                    {{ t('common.edit') }}
                  </button>
                  <button class="icon-btn icon-btn--danger" type="button" @click="remove(service)">
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
      :title="editingId ? t('admin.modalEdit') : t('admin.modalNew')"
      @close="open = false"
    >
      <form class="form" novalidate @submit.prevent="save">
        <div class="form-grid">
          <div class="field">
            <label for="s-title">{{ t('admin.fieldTitle') }} *</label>
            <input id="s-title" v-model="draft.title" class="input" type="text" />
          </div>
          <div class="field">
            <label for="s-slug">{{ t('admin.fieldSlug') }}</label>
            <input
              id="s-slug"
              v-model="draft.slug"
              class="input"
              type="text"
              :placeholder="t('admin.fieldSlugPlaceholder')"
            />
          </div>
        </div>

        <div class="form-grid">
          <div class="field">
            <label for="s-category">{{ t('admin.fieldCategory') }}</label>
            <input
              id="s-category"
              v-model="draft.category"
              class="input"
              type="text"
              list="category-list"
            />
            <datalist id="category-list">
              <option v-for="category in SERVICE_CATEGORIES" :key="category" :value="category" />
            </datalist>
          </div>
          <div class="field">
            <label for="s-icon">{{ t('admin.fieldIcon') }}</label>
            <input id="s-icon" v-model="draft.icon" class="input" type="text" maxlength="4" />
          </div>
        </div>

        <div class="form-grid">
          <div class="field">
            <label for="s-price">{{ t('admin.fieldPrice') }}</label>
            <input id="s-price" v-model="draft.price_from" class="input" type="text" />
          </div>
          <div class="field">
            <label for="s-order">{{ t('admin.fieldOrder') }}</label>
            <input id="s-order" v-model="draft.sort_order" class="input" type="number" min="1" />
          </div>
        </div>

        <div class="field">
          <label for="s-description">{{ t('admin.fieldDescription') }}</label>
          <textarea id="s-description" v-model="draft.description" class="textarea" />
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
