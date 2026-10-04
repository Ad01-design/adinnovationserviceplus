import { messages } from '../src/i18n/messages.js'
import * as content from '../src/i18n/content.js'

const walk = (o, p = []) =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? walk(v, [...p, k]) : [[[...p, k].join('.'), v]],
  )

const fr = new Map(walk(messages.fr))

for (const code of ['en', 'ht']) {
  const d = new Map(walk(messages[code]))
  const missing = [...fr.keys()].filter((k) => !d.has(k))
  const extra = [...d.keys()].filter((k) => !fr.has(k))
  const typeBad = [...fr.keys()].filter((k) => Array.isArray(fr.get(k)) !== Array.isArray(d.get(k)))
  const arrBad = [...fr.keys()].filter(
    (k) => Array.isArray(fr.get(k)) && d.get(k) && fr.get(k).length !== d.get(k).length,
  )
  console.log(`[${code}] keys=${d.size} missing=${missing.length} extra=${extra.length} typeMismatch=${typeBad.length} arrayLen=${arrBad.length}`)
  if (missing.length) console.log('  missing:', missing)
  if (extra.length) console.log('  extra:', extra)
  if (typeBad.length) console.log('  type:', typeBad)
  if (arrBad.length) console.log('  array:', arrBad)
}

const sameKeys = (a, b) => JSON.stringify(Object.keys(a).sort()) === JSON.stringify(Object.keys(b).sort())
console.log('service slugs ht =', Object.keys(content.serviceTranslations.ht).length, 'match:', sameKeys(content.serviceTranslations.en, content.serviceTranslations.ht))
console.log('categories ht match:', sameKeys(content.categoryTranslations.en, content.categoryTranslations.ht))
console.log('settings ht match:', sameKeys(content.settingsTranslations.en, content.settingsTranslations.ht))
console.log('locales:', messages && Object.keys(messages))
