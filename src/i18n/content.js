/**
 * Traductions du CONTENU (celui qui vit dans Supabase).
 *
 * Les textes métier (titres de services, accroche, arguments…) sont enregistrés
 * en français dans la base : on les surcharge ici pour l'affichage dans une autre
 * langue. Un service ajouté depuis l'admin sans traduction reste donc affiché en
 * français, sans jamais casser la page.
 */

export const serviceTranslations = {
  en: {
    'aide-demarches-administratives': {
      title: 'Administrative help & paperwork',
      description:
        'Visa assistance, file preparation and follow-up, information and step-by-step guidance through your formalities.',
      category: 'Administrative',
    },
    electricite: {
      title: 'Electrical work',
      description:
        'Electrical installation, compliance upgrades and troubleshooting for homes, shops and offices.',
      category: 'Technical',
    },
    'refrigeration-froid': {
      title: 'Refrigeration & cooling',
      description:
        'Installation, servicing and repair of freezers, refrigerated display units and cold rooms.',
      category: 'Technical',
    },
    cuisine: {
      title: 'Cooking',
      description:
        'Meal preparation for individuals, meetings and small receptions, takeaway or on site.',
      category: 'Catering',
    },
    patisserie: {
      title: 'Pastry making',
      description:
        'Cakes, pastries and sweet treats made to order for birthdays, weddings and christenings.',
      category: 'Catering',
    },
    'restauration-livraison': {
      title: 'Catering & delivery',
      description: 'Prepared meals delivered to your home or office on simple request.',
      category: 'Catering',
    },
    'service-traiteur': {
      title: 'Catering service',
      description:
        'Full catering service for your events: menus, logistics and on-site service.',
      category: 'Events',
    },
    decoration: {
      title: 'Decoration',
      description:
        'Interior decoration and event styling: spaces, tables, atmosphere and finishing touches.',
      category: 'Events',
    },
    conception: {
      title: 'Design & planning',
      description:
        'Project and installation design: plans, technical drawings, sizing and detailed quotes.',
      category: 'Technical',
    },
    'communication-marketing': {
      title: 'Communication & marketing',
      description:
        'Communication strategy, social media management and promotion of your business.',
      category: 'Digital & Communication',
    },
    'informatique-maintenance': {
      title: 'IT (maintenance)',
      description:
        'Computer servicing, software installation, data backup and technical support.',
      category: 'Digital & Communication',
    },
    infographie: {
      title: 'Graphic design',
      description:
        'Logo, flyer, poster, business card, banner and communication material design.',
      category: 'Digital & Communication',
    },
    'realisation-cv': {
      title: 'CV writing',
      description: 'Writing and laying out modern CVs and cover letters, ready to send.',
      category: 'Office & Supplies',
    },
    'assistance-en-ligne': {
      title: 'Online assistance',
      description:
        'Remote help with online procedures, file submissions and form filling.',
      category: 'Office & Supplies',
    },
    bureautique: {
      title: 'Office services',
      description:
        'Typing, formatting, printing and binding of your administrative or business documents.',
      category: 'Office & Supplies',
    },
    'vente-fournitures': {
      title: 'Supplies sales',
      description: 'School and office supplies, printing consumables and small equipment.',
      category: 'Office & Supplies',
    },
  },
  ht: {
    'aide-demarches-administratives': {
      title: 'Èd pou papye administratif',
      description:
        'Asistans pou viza, preparasyon ak swiv dosye, enfòmasyon ak akonpanyaman nan tout demach ou yo.',
      category: 'Administratif',
    },
    electricite: {
      title: 'Travay elektrik',
      description:
        'Enstalasyon elektrik, miz an nòm ak reparasyon pou kay, boutik ak biwo.',
      category: 'Teknik',
    },
    'refrigeration-froid': {
      title: 'Refrijerasyon ak fredi',
      description:
        'Enstalasyon, antretyen ak reparasyon frizè, vitrin refrijere ak chanm fredi.',
      category: 'Teknik',
    },
    cuisine: {
      title: 'Kizin',
      description:
        'Preparasyon repa pou moun, reyinyon ak ti resepsyon, pou pran ale oswa sou plas.',
      category: 'Restorasyon',
    },
    patisserie: {
      title: 'Patisri',
      description:
        'Gato, patisri ak bagay dous nou fè sou kòmand pou anivèsè, maryaj ak batèm.',
      category: 'Restorasyon',
    },
    'restauration-livraison': {
      title: 'Manje ak livrezon',
      description: 'Manje pare pou nou pote lakay ou oswa nan biwo sou yon senp demann.',
      category: 'Restorasyon',
    },
    'service-traiteur': {
      title: 'Sèvis traiteur',
      description:
        'Sèvis traiteur konplè pou evènman ou : meni, lojistik ak sèvis sou plas.',
      category: 'Evènman',
    },
    decoration: {
      title: 'Dekorasyon',
      description:
        'Dekorasyon anndan kay ak dekorasyon evènman : espas, tab, anbyans ak ti detay finisyon.',
      category: 'Evènman',
    },
    conception: {
      title: 'Planifikasyon ak konsepsyon',
      description:
        'Konsepsyon pwojè ak enstalasyon : plan, desen teknik, kalkil gwosè ak devi byen detaye.',
      category: 'Teknik',
    },
    'communication-marketing': {
      title: 'Kominikasyon ak maketing',
      description:
        'Estrateji kominikasyon, jere rezo sosyal ak fè pwomosyon pou biznis ou.',
      category: 'Dijital ak Kominikasyon',
    },
    'informatique-maintenance': {
      title: 'Enfomatik (antretyen)',
      description:
        'Antretyen òdinatè, enstalasyon pwogram, sovgad done ak sipò teknik.',
      category: 'Dijital ak Kominikasyon',
    },
    infographie: {
      title: 'Kreyasyon grafik',
      description:
        'Kreyasyon logo, flyer, afich, kat biznis, banner ak zouti kominikasyon.',
      category: 'Dijital ak Kominikasyon',
    },
    'realisation-cv': {
      title: 'Fè CV',
      description:
        'Ekri ak mete an paj CV ak lèt motivasyon modèn, pare pou ou voye.',
      category: 'Travay biwo ak founiti',
    },
    'assistance-en-ligne': {
      title: 'Asistans sou entènèt',
      description:
        'Èd a distans pou demach sou entènèt, soumisyon dosye ak ranpli fòmilè.',
      category: 'Travay biwo ak founiti',
    },
    bureautique: {
      title: 'Sèvis biwo',
      description:
        'Tape, mete an paj, enprime ak relye dokiman administratif oswa biznis ou yo.',
      category: 'Travay biwo ak founiti',
    },
    'vente-fournitures': {
      title: 'Vann founiti',
      description:
        'Founiti lekòl ak biwo, konsomatib pou enprime ak ti ekipman.',
      category: 'Travay biwo ak founiti',
    },
  },
}

export const categoryTranslations = {
  en: {
    Administratif: 'Administrative',
    Technique: 'Technical',
    Restauration: 'Catering',
    'Événementiel': 'Events',
    'Digital & Communication': 'Digital & Communication',
    'Bureautique & Fournitures': 'Office & Supplies',
  },
  ht: {
    Administratif: 'Administratif',
    Technique: 'Teknik',
    Restauration: 'Restorasyon',
    'Événementiel': 'Evènman',
    'Digital & Communication': 'Dijital ak Kominikasyon',
    'Bureautique & Fournitures': 'Travay biwo ak founiti',
  },
}

export const settingsTranslations = {
  en: {
    tagline: 'Your local partner for efficient, lasting work.',
    about:
      'From administrative paperwork to electrical and refrigeration work, from IT maintenance and graphic design to cooking, pastry, catering and event decoration — AD INNOVATION SERVICES PLUS handles it all for individuals, shopkeepers and businesses. One team, many trades, work done properly.',
    address: 'Ouanaminthe, Manquette — Haiti',
    hours: 'Monday – Saturday: 8:00 am – 8:00 pm',
    savoir_faire: 'IT · Artificial intelligence · Networking · Marketing',
    why_rapidite: 'Speed — we reply and act without dragging things out.',
    why_efficacite: 'Efficiency — one team for your paperwork, installations and creative work.',
    why_satisfaction: 'Satisfaction — your approval before we move to the next step.',
    why_prix: 'Affordable prices — clear quotes, no hidden fees.',
  },
  ht: {
    tagline: 'Patnè lokal ou pou yon travay byen fèt ki dire.',
    about:
      'Depi demach administratif yo rive nan travay elektrik ak refrijerasyon, depi antretyen enfomatik ak kreyasyon grafik rive nan kizin, patisri, restorasyon ak dekorasyon evènman — AD INNOVATION SERVICES PLUS okipe tout bagay pou moun, boutikè ak antrepriz. Yon sèl ekip, plizyè metye, travay byen fèt.',
    address: 'Ouanaminthe, Manquette — Ayiti',
    hours: 'Lendi – Samdi : 8 è nan maten – 8 è nan aswè',
    savoir_faire: 'Enfomatik · Entèlijans atifisyèl · Rezo · Maketing',
    why_rapidite: 'Rapidite — nou reponn epi nou aji san nou pa tann.',
    why_efficacite: 'Efikasite — yon sèl ekip pou papye ou yo, enstalasyon ou yo ak travay kreyatif ou yo.',
    why_satisfaction: 'Satisfaksyon — ou dakò anvan nou pase nan lòt etap la.',
    why_prix: 'Pri ki bon — devi klè, san frè kache.',
  },
}

export function localizeService(service, locale) {
  if (!service || locale === 'fr') return service
  const override = serviceTranslations[locale]?.[service.slug]
  const category = categoryTranslations[locale]?.[service.category]
  if (!override && !category) return service
  return {
    ...service,
    ...override,
    category: override?.category ?? category ?? service.category,
  }
}

export function localizeSettings(settings, locale) {
  if (locale === 'fr') return settings
  const override = settingsTranslations[locale] || {}
  return { ...settings, ...override }
}