import { computed, ref, watch } from 'vue'
import { LOCALES, messages } from './messages'

const STORAGE_KEY = 'ao.locale'
const DEFAULT_LOCALE = 'fr'

const LOCALE_TAGS = { fr: 'fr-FR', en: 'en-GB', ht: 'ht-HT' }

function detectLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && messages[saved]) return saved
  } catch {
    /* stockage indisponible */
  }
  const browser = typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2) : null
  return browser && messages[browser] ? browser : DEFAULT_LOCALE
}

export const locale = ref(detectLocale())

function setLocale(code) {
  if (!messages[code]) return
  locale.value = code
}

watch(
  locale,
  (code) => {
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      /* stockage indisponible */
    }
    if (typeof document !== 'undefined') document.documentElement.lang = code
  },
  { immediate: true },
)

/** Valeurs possibles des statuts (elles sont stockées telles quelles en base). */
export const quoteStatusKeys = ['nouveau', 'en_cours', 'envoye', 'clos']
export const messageStatusKeys = ['nouveau', 'traite', 'archive']

function resolve(dict, path) {
  return path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), dict)
}

export function useI18n() {
  const dictionary = computed(() => messages[locale.value] || messages[DEFAULT_LOCALE])

  function t(key, params) {
    let value = resolve(dictionary.value, key)
    if (value === undefined) value = resolve(messages[DEFAULT_LOCALE], key)
    if (Array.isArray(value)) return value
    if (typeof value !== 'string') return key
    if (!params) return value
    return Object.entries(params).reduce(
      (text, [name, replacement]) =>
        text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(replacement)),
      value,
    )
  }

  /** Libellé lisible d'un statut stocké en base (ex. "en_cours"). */
  function statusLabel(kind, value) {
    if (!value) return '—'
    return t(`status.${kind}.${value}`)
  }

  return {
    locale,
    locales: LOCALES,
    setLocale,
    t,
    statusLabel,
    localeTag: computed(() => LOCALE_TAGS[locale.value] || 'fr-FR'),
  }
}
