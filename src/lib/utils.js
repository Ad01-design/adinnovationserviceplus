import { locale } from '@/i18n'

const LOCALE_TAGS = { fr: 'fr-FR', en: 'en-GB', ht: 'ht-HT' }

export function digits(value = '') {
  return String(value).replace(/\D/g, '')
}

/** Indicatif par défaut : l'entreprise est en Haïti (+509). */
const DEFAULT_COUNTRY_CODE = '509'

/**
 * Normalise un numéro en format international sans « + ».
 * Un numéro déjà international (ex. 229…) n'est jamais re-préfixé.
 */
function normalizePhone(phone = '') {
  let d = digits(phone)
  if (d.startsWith('00')) d = d.slice(2)
  if (!d.startsWith(DEFAULT_COUNTRY_CODE) && d.length <= 11) d = `${DEFAULT_COUNTRY_CODE}${d}`
  return d
}

/** Convertit un numéro (local ou international) en lien appelable. */
export function telLink(phone = '') {
  const d = normalizePhone(phone)
  if (!d) return ''
  return `tel:+${d}`
}

/** Construit un lien WhatsApp (avec message pré-rempli optionnel). */
export function whatsappLink(phone = '', text = '') {
  const d = normalizePhone(phone)
  if (!d) return ''
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

/** Formate une date dans la langue courante de l'interface. */
export function formatDate(value, withTime = true) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(LOCALE_TAGS[locale.value] || 'fr-FR', {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' } : {}),
  })
}

export function slugify(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function statusTone(status) {
  switch (status) {
    case 'nouveau':
      return 'warning'
    case 'en_cours':
      return 'info'
    case 'envoye':
    case 'traite':
      return 'success'
    default:
      return 'muted'
  }
}
