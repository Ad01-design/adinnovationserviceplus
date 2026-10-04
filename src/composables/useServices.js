import { computed, ref } from 'vue'
import * as api from '@/lib/api'
import { localizeService } from '@/i18n/content'
import { locale } from '@/i18n'

const services = ref([])
const loading = ref(false)
const error = ref('')
let loaded = false

/** Services traduits dans la langue courante (affichage public). */
const displayed = computed(() => services.value.map((service) => localizeService(service, locale.value)))

const displayedCategories = computed(() =>
  [...new Set(displayed.value.map((service) => service.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  ),
)

export function useServices() {
  const categories = computed(() =>
    [...new Set(services.value.map((service) => service.category).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'fr'),
    ),
  )

  async function load(force = false) {
    if (loaded && !force) return services.value
    loading.value = true
    error.value = ''
    try {
      services.value = await api.getServices()
      loaded = true
    } catch (err) {
      error.value = err.message
      console.error('[services]', err)
    } finally {
      loading.value = false
    }
    return services.value
  }

  async function loadAll() {
    loading.value = true
    error.value = ''
    try {
      services.value = await api.getServices({ includeInactive: true })
      loaded = true
    } catch (err) {
      error.value = err.message
      console.error('[services]', err)
    } finally {
      loading.value = false
    }
    return services.value
  }

  return { services, displayed, categories, displayedCategories, loading, error, load, loadAll }
}
