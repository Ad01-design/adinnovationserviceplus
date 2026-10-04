-- ============================================================================
--  AD INNOVATION SERVICES PLUS — Schéma de base de données Supabase
--  À exécuter dans Supabase Studio > SQL Editor > New query > Run
--  Le script est idempotent : vous pouvez le relancer sans risque.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
--  Utilitaire : met à jour la colonne updated_at
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
--  Autorisation administrateur.
--
--  `authenticated` signifie simplement « possède une session valide », ce qui
--  n'est PAS la même chose que « administrateur ». On restreint donc toutes les
--  écritures (et les lectures sensibles) à une liste blanche d'utilisateurs
--  enregistrés dans public.admins.
--
--  Pour désigner un administrateur :
--      insert into public.admins (user_id)
--      select id from auth.users where email = 'vous@exemple.com';
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- La table elle-même est protégée : RLS activée, aucune policy → inaccessible
-- via l'API avec la clé anon. Seul le SQL Editor (service role) peut la gérer.
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ===========================================================================
--  1. SERVICES
-- ===========================================================================
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  description text,
  icon        text not null default '✨',
  category    text not null default 'Divers',
  price_from  text,
  featured    boolean not null default false,
  active      boolean not null default true,
  sort_order  integer not null default 100,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists services_category_idx on public.services (category);
create index if not exists services_sort_idx on public.services (sort_order);

drop trigger if exists services_touch_updated_at on public.services;
create trigger services_touch_updated_at
  before update on public.services
  for each row execute function public.touch_updated_at();

alter table public.services enable row level security;

-- Lecture publique (catalogue affiché sur le site).
drop policy if exists "services_read_all" on public.services;
create policy "services_read_all"
  on public.services for select
  using (true);

-- Écriture réservée aux administrateurs.
drop policy if exists "services_write_authenticated" on public.services;
drop policy if exists "services_write_admin" on public.services;
create policy "services_write_admin"
  on public.services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
--  2. MESSAGES (formulaire de contact)
-- ===========================================================================
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  phone      text,
  subject    text,
  message    text not null,
  status     text not null default 'nouveau',   -- nouveau | traite | archive
  created_at timestamptz not null default now()
);

create index if not exists messages_created_idx on public.messages (created_at desc);

alter table public.messages enable row level security;

-- Insertion publique (formulaire de contact) avec garde-fous : on limite la
-- taille des champs et on impose le statut initial, pour empêcher un visiteur
-- malveillant d'injecter des statuts arbitraires ou des contenus démesurés.
drop policy if exists "messages_insert_public" on public.messages;
create policy "messages_insert_public"
  on public.messages for insert
  to anon, authenticated
  with check (
    char_length(coalesce(name, ''))    between 1 and 200
    and char_length(coalesce(message, '')) between 1 and 5000
    and char_length(coalesce(email, ''))   <= 320
    and char_length(coalesce(phone, ''))   <= 40
    and char_length(coalesce(subject, '')) <= 200
    and status = 'nouveau'
  );

-- Lecture / modification / suppression réservées aux administrateurs.
drop policy if exists "messages_read_authenticated" on public.messages;
drop policy if exists "messages_read_admin" on public.messages;
create policy "messages_read_admin"
  on public.messages for select
  to authenticated using (public.is_admin());

drop policy if exists "messages_update_authenticated" on public.messages;
drop policy if exists "messages_update_admin" on public.messages;
create policy "messages_update_admin"
  on public.messages for update
  to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "messages_delete_authenticated" on public.messages;
drop policy if exists "messages_delete_admin" on public.messages;
create policy "messages_delete_admin"
  on public.messages for delete
  to authenticated using (public.is_admin());

-- ===========================================================================
--  3. DEVIS (demandes de devis)
-- ===========================================================================
create table if not exists public.quotes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  email      text,
  service    text not null,
  city       text,
  budget     text,
  deadline   date,
  details    text,
  status     text not null default 'nouveau',   -- nouveau | en_cours | envoye | clos
  created_at timestamptz not null default now()
);

create index if not exists quotes_created_idx on public.quotes (created_at desc);

alter table public.quotes enable row level security;

-- Insertion publique (demande de devis) avec garde-fous de taille/statut.
drop policy if exists "quotes_insert_public" on public.quotes;
create policy "quotes_insert_public"
  on public.quotes for insert
  to anon, authenticated
  with check (
    char_length(coalesce(name, ''))    between 1 and 200
    and char_length(coalesce(phone, '')) between 1 and 40
    and char_length(coalesce(service, '')) between 1 and 200
    and char_length(coalesce(email, ''))   <= 320
    and char_length(coalesce(city, ''))    <= 200
    and char_length(coalesce(budget, ''))  <= 200
    and char_length(coalesce(details, '')) <= 5000
    and status = 'nouveau'
  );

-- Lecture / modification / suppression réservées aux administrateurs.
drop policy if exists "quotes_read_authenticated" on public.quotes;
drop policy if exists "quotes_read_admin" on public.quotes;
create policy "quotes_read_admin"
  on public.quotes for select
  to authenticated using (public.is_admin());

drop policy if exists "quotes_update_authenticated" on public.quotes;
drop policy if exists "quotes_update_admin" on public.quotes;
create policy "quotes_update_admin"
  on public.quotes for update
  to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "quotes_delete_authenticated" on public.quotes;
drop policy if exists "quotes_delete_admin" on public.quotes;
create policy "quotes_delete_admin"
  on public.quotes for delete
  to authenticated using (public.is_admin());

-- ===========================================================================
--  4. PARAMÈTRES DU SITE (clé / valeur)
-- ===========================================================================
create table if not exists public.site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "settings_read_all" on public.site_settings;
create policy "settings_read_all"
  on public.site_settings for select
  using (true);

-- Attention : cette table est lisible publiquement — n'y stockez JAMAIS de
-- secret (clé API, mot de passe, e-mail privé, etc.).
drop policy if exists "settings_write_authenticated" on public.site_settings;
drop policy if exists "settings_write_admin" on public.site_settings;
create policy "settings_write_admin"
  on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
--  5. ÉQUIPE
-- ===========================================================================
create table if not exists public.team (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text,
  bio        text,
  photo      text,                                -- URL de la photo
  active     boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists team_sort_idx on public.team (sort_order);

drop trigger if exists team_touch_updated_at on public.team;
create trigger team_touch_updated_at
  before update on public.team
  for each row execute function public.touch_updated_at();

alter table public.team enable row level security;

drop policy if exists "team_read_all" on public.team;
create policy "team_read_all"
  on public.team for select
  using (true);

drop policy if exists "team_write_authenticated" on public.team;
drop policy if exists "team_write_admin" on public.team;
create policy "team_write_admin"
  on public.team for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
--  6. RÉALISATIONS (portfolio)
-- ===========================================================================
create table if not exists public.realisations (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  image       text,                               -- URL de l'image
  category    text,
  featured    boolean not null default false,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists realisations_created_idx on public.realisations (created_at desc);

drop trigger if exists realisations_touch_updated_at on public.realisations;
create trigger realisations_touch_updated_at
  before update on public.realisations
  for each row execute function public.touch_updated_at();

alter table public.realisations enable row level security;

drop policy if exists "realisations_read_all" on public.realisations;
create policy "realisations_read_all"
  on public.realisations for select
  using (true);

drop policy if exists "realisations_write_authenticated" on public.realisations;
drop policy if exists "realisations_write_admin" on public.realisations;
create policy "realisations_write_admin"
  on public.realisations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
--  7. DONNÉES DE DÉPART
-- ===========================================================================

-- ---- Coordonnées / identité ------------------------------------------------
insert into public.site_settings (key, value) values
  ('brand_name',    'AD INNOVATION SERVICES PLUS'),
  ('tagline',       'Votre partenaire local pour un travail efficace et durable.'),
  ('about',         'Des démarches administratives aux travaux d'électricité et de froid, de la maintenance informatique et de l'infographie à la cuisine, à la pâtisserie, à la restauration et à la décoration d'événements — AD INNOVATION SERVICES PLUS prend tout en charge pour les particuliers, les commerçants et les entreprises. Une seule équipe, plusieurs métiers, un travail soigné.'),
  ('phone1',        '(509) 4076 38 40'),
  ('phone2',        '3873 34 01'),
  ('phone3',        ''),
  ('whatsapp',      '50940763840'),
  ('email',         'aoinnovation@gmail.com'),
  ('address',       'Ouanaminthe, Manquette — Haïti'),
  ('hours',         'Lundi – Samedi : 08h00 – 20h00'),
  ('tiktok',        'https://www.tiktok.com/@aoinnovation'),
  ('facebook',      'https://www.facebook.com/aoinnovation'),
  ('savoir_faire',  'Informatique · Intelligence artificielle · Réseau · Marketing'),
  ('why_rapidite',  'Rapidité — nous répondons et intervenons sans faire traîner les choses.'),
  ('why_efficacite','Efficacité — une seule équipe pour vos démarches, vos installations et vos créations.'),
  ('why_satisfaction','Satisfaction — votre validation avant de passer à l''étape suivante.'),
  ('why_prix',      'Prix abordable — des devis clairs, sans frais cachés.')
on conflict (key) do nothing;

-- ---- Catalogue de services -------------------------------------------------
insert into public.services (slug, title, description, icon, category, price_from, featured, sort_order) values
  ('aide-demarches-administratives',
   'Aide et démarches administratives',
   'Assistance visa, constitution et suivi de dossiers, renseignements et accompagnement pas à pas dans vos formalités.',
   '🗂️', 'Administratif', 'Sur devis', true, 10),

  ('electricite',
   'Électricité',
   'Installation, mise aux normes et dépannage électrique pour maisons, boutiques et bureaux.',
   '💡', 'Technique', 'Sur devis', true, 20),

  ('refrigeration-froid',
   'Réfrigération & Froid',
   'Installation, entretien et réparation de congélateurs, vitrines réfrigérées et chambres froides.',
   '❄️', 'Technique', 'Sur devis', false, 30),

  ('cuisine',
   'Cuisine',
   'Préparation de repas pour particuliers, réunions et petites réceptions, à emporter ou en place.',
   '🍳', 'Restauration', 'Sur devis', false, 40),

  ('patisserie',
   'Pâtisserie',
   'Gâteaux, pâtisseries et douceurs sur commande pour anniversaires, mariages et baptêmes.',
   '🎂', 'Restauration', 'Sur devis', false, 50),

  ('restauration-livraison',
   'Restauration & Livraison',
   'Repas préparés et livraison à domicile ou au bureau sur simple commande.',
   '🛵', 'Restauration', 'Sur devis', false, 60),

  ('service-traiteur',
   'Service traiteur',
   'Organisation complète du service traiteur pour vos événements : menus, logistique et service sur place.',
   '🍽️', 'Événementiel', 'Sur devis', true, 70),

  ('decoration',
   'Décoration',
   'Décoration d''intérieur et mise en scène d''événements : espaces, tables, ambiance et finitions.',
   '🎀', 'Événementiel', 'Sur devis', false, 80),

  ('conception',
   'Conception',
   'Conception de projets et d''installations : plans, schémas techniques, dimensionnement et devis détaillé.',
   '📐', 'Technique', 'Sur devis', false, 90),

  ('communication-marketing',
   'Communication & Marketing',
   'Stratégie de communication, animation de vos réseaux sociaux et promotion de votre activité.',
   '📣', 'Digital & Communication', 'Sur devis', true, 100),

  ('informatique-maintenance',
   'Informatique (maintenance)',
   'Entretien d''ordinateurs, installation de logiciels, sauvegarde de données et assistance technique.',
   '💻', 'Digital & Communication', 'Sur devis', false, 110),

  ('infographie',
   'Infographie',
   'Création de logos, flyers, affiches, cartes de visite, bâches et supports de communication.',
   '🎨', 'Digital & Communication', 'Sur devis', true, 120),

  ('realisation-cv',
   'Réalisation de CV',
   'Rédaction et mise en page de CV et lettres de motivation modernes, prêts à envoyer.',
   '📄', 'Bureautique & Fournitures', 'Sur devis', false, 130),

  ('assistance-en-ligne',
   'Assistance en ligne',
   'Aide à distance pour vos démarches en ligne, dépôts de dossiers et remplissage de formulaires.',
   '🌐', 'Bureautique & Fournitures', 'Sur devis', false, 140),

  ('bureautique',
   'Bureautique',
   'Saisie, mise en forme, impression et reliure de vos documents administratifs ou commerciaux.',
   '🖨️', 'Bureautique & Fournitures', 'Sur devis', false, 150),

  ('vente-fournitures',
   'Vente de fournitures',
   'Fournitures scolaires et de bureau, consommables d''impression et petit matériel.',
   '📦', 'Bureautique & Fournitures', 'Sur devis', false, 160)
on conflict (slug) do nothing;