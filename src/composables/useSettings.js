import { computed, ref } from 'vue'
import * as api from '@/lib/api'
import { BRAND_DEFAULTS } from '@/lib/brandDefaults'
import { localizeSettings } from '@/i18n/content'
import { locale } from '@/i18n'

const raw = ref({ ...BRAND_DEFAULTS })
const loading = ref(false)
let loaded = false

/** Paramètres traduits dans la langue courante (affichage public). */
const settings = computed(() => localizeSettings(raw.value, locale.value))

export function useSettings() {
  async function load(force = false) {
    if (loaded && !force) return raw.value
    loading.value = true
    try {
      // La base gagne sur les valeurs par défaut ; un champ laissé vide en base
      // (chaîne vide) reste vide, seule une ligne absente retombe sur le défaut.
      raw.value = { ...BRAND_DEFAULTS, ...(await api.getSettings()) }
      loaded = true
    } catch (error) {
      console.error('[settings]', error)
    } finally {
      loading.value = false
    }
    return raw.value
  }

  async function update(patch) {
    raw.value = { ...BRAND_DEFAULTS, ...(await api.saveSettings(patch)) }
    loaded = true
    return raw.value
  }

  return { settings, raw, loading, load, update }
}
