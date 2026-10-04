# AD INNOVATION SERVICES PLUS

Site vitrine + back-office construits avec **Vue 3 (Vite)** et **Supabase**.
Content taken from the handwritten business brief: 16 services, 3 phone numbers, email, Godomey location, and the "why choose us" arguments.

---

## 1. Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

The app reads and writes **only through Supabase** — there is no local fallback, so define
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` before starting the dev server. Without them
every request fails with an explicit "Supabase n'est pas configuré" error.

## 2. Connect Supabase

1. Create a project at <https://supabase.com>.
2. Open **SQL Editor → New query**, paste the whole content of `supabase/schema.sql`, press **Run**.
   It creates `services`, `messages`, `quotes`, `site_settings`, `team` and `realisations`, enables
   Row Level Security and inserts the seed data (16 services + contact details).
3. Create your admin user: **Authentication → Users → Add user**. Use that email/password to sign in
   at `/connexion`.
4. Copy the config:

   ```bash
   cp .env.example .env
   ```

   Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (found in
   **Project Settings → API**). The anon key is safe to expose in the browser.
5. Restart the dev server (`npm run dev`) — you are now reading live data.

Security model (from `schema.sql`): visitors can read services/settings and **insert** messages and
quotes, but only a logged-in admin can read/update/delete them.

## 3. Pages

| Route        | What it does                                                        |
| ------------ | ------------------------------------------------------------------- |
| `/`          | Hero, service highlights, stats, "why choose us", savoir-faire band  |
| `/services`  | Full catalogue with category chips + keyword search                  |
| `/contact`   | Contact form → `messages` table, plus phone/WhatsApp/email tiles     |
| `/devis`     | Quote request form → `quotes` table (pre-fillable from a service)    |
| `/connexion` | Admin login (Supabase Auth)                                          |
| `/admin`     | Dashboard, quotes, messages, service CRUD, site settings             |

Mobile: the header collapses into a slide-in side drawer (hamburger → overlay + right-hand panel).

## 4. Languages

The navbar has a **🌐 FR / EN / HT** switcher (French, English, **Kreyòl Ayisyen** — Haitian Creole).
It translates the whole interface (nav, home, forms, footer, admin) and remembers the choice in
`localStorage`. Dates are formatted in the selected language too.

Translations live in three files:

| File | Covers |
| --- | --- |
| `src/i18n/messages.js` | every interface string (`fr`, `en` and `ht` dictionaries) |
| `src/i18n/content.js` | business content: service titles/descriptions and the site settings |
| `src/i18n/index.js` | the `useI18n()` composable, locale detection & persistence |

Business text (service names, tagline, "why choose us"…) is stored in French in Supabase, and
`src/i18n/content.js` provides the display translation. A service created later in the admin
without a translation simply stays in French — it never breaks the page.

To add another language: add it to `LOCALES` and its dictionary in `src/i18n/messages.js`, add its
entry to the three maps in `src/i18n/content.js`, and its date tag to both `LOCALE_TAGS` objects
(`src/i18n/index.js` and `src/lib/utils.js`).

## 5. Installable app & low bandwidth

The site is a **PWA**: visitors can add it to their home screen and open it again with almost
no data exchanged.

- `public/manifest.webmanifest` — name, colours, start URL, two shortcuts (*Devis*, *Services*).
- `public/sw.js` — hand-written service worker (≈2 KB, no library):
  - **pages**: network first, falls back to the cached copy → still openable offline;
  - **JS/CSS/images**: cache first with a background refresh → instant reopening;
  - the Supabase API and every non-GET request go straight to the network (never cached);
  - respects `navigator.connection.saveData`.
- A bottom bar invites Android/Chrome users to install, tells iOS users how to do it
  (`Share → Add to Home Screen`), and warns when the connection drops.
- On iOS/Safari the install bar only shows a hint (Apple exposes no install event).

Weight kept down on purpose:

| Measure | Effect |
| --- | --- |
| System font stack (no webfont) | no font download, no render-blocking request |
| One JS chunk + lazy-loaded route views | first page ≈ 71 KB gzip total |
| Supabase imported statically, not dynamically | tree-shakes to ~9 KB instead of a 214 KB namespace chunk |
| No icon library, icons compressed to 2–38 KB | derived from the supplied logo file |

> The header logo (`src/assets/logo.jpg`, 13 KB) and the icons in `public/icons/` were produced
> from the original logo file: margins trimmed, colours flattened and large icons encoded as JPEG
> (a PNG of the same mark weighed 380 KB). To redo it after a logo change:
>
> ```powershell
> powershell -ExecutionPolicy Bypass -File scripts/prepare-logo.ps1 -Source "C:\path\to\logo.(jpg|png)"
> ```
>
> The service worker is only registered in production builds, and its caches are keyed by the
> `VERSION` constant in `public/sw.js` — bump it when you deploy so every visitor gets the new
> files instead of stale cached ones.

### Changing the hero photo

The home page banner uses `src/assets/hero.jpg` behind a dark gradient scrim (the scrim keeps the
white text readable, darker on mobile). To use your own photo:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/prepare-hero.ps1 -Source "C:\path\to\photo.jpg"
```

It crops to 16:9, resizes to 960×540 and re-encodes to roughly 50 KB — big enough for a full-width
banner, small enough for a weak connection. Drop in a replacement manually if you prefer, but keep
it near 100 KB. Visitors who turned on the browser's "data saver" get the navy gradient instead.

## 6. Project structure

```
src/
  lib/
    supabase.js      client + config detection
    api.js           data layer (Supabase or localStorage fallback)
    demoData.js      seed content from the brief
    utils.js         phone/WhatsApp links, date & slug helpers
  composables/       useAuth, useSettings, useServices, useToast
  components/        AppHeader, AppFooter, ServiceCard, ModalDialog, toasts…
  views/             public pages
  views/admin/       back-office pages
  assets/styles.css  design system (no CSS framework needed)
  assets/logo.jpg    brand logo used in the header, drawer and admin sidebar
  assets/hero.jpg    home-page hero background photo (~50 KB)
  lib/pwa.js         service worker registration + install prompt
public/manifest.webmanifest  PWA manifest
public/sw.js                 offline / cache strategies
public/icons/                app icons generated from the logo
scripts/prepare-logo.ps1     trims the logo and rebuilds those icons
scripts/prepare-hero.ps1     crops & compresses a photo into assets/hero.jpg
supabase/schema.sql  tables, RLS policies, seed data
```

## 7. Editing content

Everything visible on the site is editable from **`/admin`**:

- **Services** — add/edit/delete, toggle "visible" and "featured", change order.
- **Paramètres** — company name, tagline, the 3 phone numbers, WhatsApp number, email,
  address, opening hours, social links and the 4 "why choose us" arguments.

## 8. Build & deploy

```bash
npm run build     # output: dist/
npm run preview   # serve the build locally
```

Deploy `dist/` to Vercel / Netlify / any static host. Set the two `VITE_SUPABASE_*`
variables in the host's env settings and add an SPA rewrite rule so every path falls
back to `index.html`.