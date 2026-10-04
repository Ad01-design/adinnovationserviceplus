/**
 * Identité de l'entreprise (coordonnées, réseaux sociaux, textes de présentation).
 *
 * Ces valeurs sont la source de repli : elles garantissent que le site affiche
 * toujours les coordonnées réelles, même si la table `site_settings` est vide
 * ou si Supabase n'a pas encore été configuré.
 *
 * Dès qu'une valeur existe en base, c'est elle qui gagne (l'admin peut donc
 * vider un champ en l'enregistrant vide). Les données métier — services, équipe,
 * réalisations — restent, elles, exclusivement en base.
 */

/**
 * Nom court de l'application, utilisé dans l'invitation à installer
 * (« Installez l'app AD Innovation »). Doit rester identique à `short_name`
 * de public/manifest.webmanifest.
 */
export const APP_SHORT_NAME = 'AD Innovation'

export const BRAND_DEFAULTS = {
  brand_name: 'AD INNOVATION SERVICES PLUS',
  tagline: 'Votre partenaire local pour un travail efficace et durable.',
  about:
    'Des démarches administratives aux travaux d’électricité et de froid, de la maintenance informatique et de l’infographie à la cuisine, à la pâtisserie, à la restauration et à la décoration d’événements — AD INNOVATION SERVICES PLUS prend tout en charge pour les particuliers, les commerçants et les entreprises. Une seule équipe, plusieurs métiers, un travail soigné.',
  phone1: '+(509) 4076 38 40',
  phone2: '+(509) 3873 34 01',
  phone3: '',
  whatsapp: '50940763840',
  email: 'infos.adinnovation@gmail.com',
  address: 'Ouanaminthe, Manquette — Haïti',
  hours: 'Lundi – Samedi : 08h00 – 20h00',
  tiktok: 'https://www.tiktok.com/@aoinnovation',
  facebook: 'https://www.facebook.com/aoinnovation',
  savoir_faire: 'Informatique · Intelligence artificielle · Réseau · Marketing',
  why_rapidite: 'Rapidité — nous répondons et intervenons sans faire traîner les choses.',
  why_efficacite:
    'Efficacité — une seule équipe pour vos démarches, vos installations et vos créations.',
  why_satisfaction: 'Satisfaction — votre validation avant de passer à l’étape suivante.',
  why_prix: 'Prix abordable — des devis clairs, sans frais cachés.',
}
