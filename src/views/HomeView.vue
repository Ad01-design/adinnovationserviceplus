<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ServiceCard from '@/components/ServiceCard.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import ContactSection from '@/components/ContactSection.vue'
import PwaInstallCard from '@/components/PwaInstallCard.vue'
import { useServices } from '@/composables/useServices'
import { useSettings } from '@/composables/useSettings'
import { useI18n } from '@/i18n'
import { telLink, whatsappLink } from '@/lib/utils'
import heroBg1 from '@/assets/hero-1.jpg'
import heroBg2 from '@/assets/hero-2.jpg'
import heroBg3 from '@/assets/hero-3.jpg'
import heroBg4 from '@/assets/hero-4.jpg'

const { displayed: services, loading, load } = useServices()
const { settings, load: loadSettings } = useSettings()
const { t, locale } = useI18n()

/* Typing effect for tagline - never ending loop */
const typedTagline = ref('')
let typingTimer = null
let isTyping = true

const startTypingLoop = () => {
  if (typingTimer) clearTimeout(typingTimer)
  const fullText = settings.value.tagline || ''
  typedTagline.value = ''
  isTyping = true
  let charIndex = 0
  
  const typeChar = () => {
    if (isTyping) {
      if (charIndex < fullText.length) {
        typedTagline.value += fullText[charIndex]
        charIndex++
        typingTimer = setTimeout(typeChar, 50)
      } else {
        // Finished typing, pause then start erasing
        isTyping = false
        typingTimer = setTimeout(eraseChar, 2000)
      }
    }
  }
  
  const eraseChar = () => {
    if (!isTyping) {
      if (charIndex > 0) {
        charIndex--
        typedTagline.value = fullText.substring(0, charIndex)
        typingTimer = setTimeout(eraseChar, 30)
      } else {
        // Finished erasing, pause then start typing again
        isTyping = true
        typingTimer = setTimeout(typeChar, 500)
      }
    }
  }
  
  typeChar()
}

watch(() => settings.value.tagline, () => {
  startTypingLoop()
}, { immediate: true })

watch(locale, () => {
  startTypingLoop()
})

/* Diaporama du bandeau : changement d'image toutes les 5 secondes. */
const HERO_BACKGROUNDS = [heroBg1, heroBg2, heroBg3, heroBg4]
const heroBgIndex = ref(0)
let heroTimer = null

/* Les métiers mis en avant dans le bandeau : icônes alignées sur home.panelItems. */
const TRADE_ICONS = ['⚡', '🚿', '🧱', '☀️', '📹']

const heroTrades = computed(() =>
  t('home.panelItems').map((label, index) => ({
    icon: TRADE_ICONS[index] ?? '🔧',
    label,
  })),
)

/* Cartes de la section « Nos domaines » : services offerts uniquement. */
const HIGHLIGHTS_DATA = [
  { id: 'electrical', icon: '⚡', title: 'home.serviceElectrical', description: 'home.serviceElectricalDesc', category: 'home.categoryTechnical' },
  { id: 'plumbing', icon: '', title: 'home.servicePlumbing', description: 'home.servicePlumbingDesc', category: 'home.categoryTechnical' },
  { id: 'tiling', icon: '🧱', title: 'home.serviceTiling', description: 'home.serviceTilingDesc', category: 'home.categoryTechnical' },
  { id: 'solar', icon: '☀️', title: 'home.serviceSolar', description: 'home.serviceSolarDesc', category: 'home.categoryTechnical' },
  { id: 'cctv', icon: '📹', title: 'home.serviceCCTV', description: 'home.serviceCCTVDesc', category: 'home.categoryTechnical' },
]

const highlights = computed(() =>
  HIGHLIGHTS_DATA.map((item) => ({
    id: item.id,
    icon: item.icon,
    title: t(item.title),
    description: t(item.description),
    category: t(item.category),
  })),
)

/* Sur mobile, une seule carte service est visible jusqu'au clic sur « Voir plus ». */
const servicesExpanded = ref(false)

const team = ref([])
/* Index libre (peut dépasser la liste) : la liste est dupliquée pour boucler sans fin. */
const activeMember = ref(0)
const instant = ref(false)

/* Liste affichée trois fois : on évolue dans la copie du milieu, avec toujours
   une carte à gauche et une à droite pour le rendu « coverflow ». */
const loopMembers = computed(() => [...team.value, ...team.value, ...team.value])

function prevMember() {
  const n = team.value.length
  if (!n) return
  restartTeamAutoplay()
  if (activeMember.value === n) {
    /* On se place sur la dernière copie, sans animation, puis on avance d'un cran. */
    instant.value = true
    activeMember.value = 2 * n
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        instant.value = false
        activeMember.value = 2 * n - 1
      })
    })
    return
  }
  activeMember.value -= 1
}

function nextMember() {
  if (!team.value.length) return
  activeMember.value += 1
  /* Un clic manuel relance le compte à rebours : on laisse 6 s entières. */
  restartTeamAutoplay()
}

/* Défilement automatique : une carte toutes les 6 s. */
const TEAM_AUTOPLAY_MS = 6000
let teamTimer = null

function stopTeamAutoplay() {
  if (teamTimer) clearInterval(teamTimer)
  teamTimer = null
}

function startTeamAutoplay() {
  if (teamTimer || team.value.length < 2) return
  /* Respect du réglage système : pas de mouvement si l'utilisateur l'a demandé. */
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  teamTimer = setInterval(() => {
    if (!team.value.length) return
    activeMember.value += 1
  }, TEAM_AUTOPLAY_MS)
}

function restartTeamAutoplay() {
  if (!teamTimer) return
  stopTeamAutoplay()
  startTeamAutoplay()
}

/* Clic sur une carte : on la centre, puis on repart pour 6 s. */
function selectMember(i) {
  activeMember.value = i
  restartTeamAutoplay()
}

/* Une fois l'animation terminée, on ramène l'index dans la copie du milieu. */
function onTrackTransitionEnd() {
  const n = team.value.length
  if (!n) return
  if (activeMember.value >= 2 * n || activeMember.value < n) {
    instant.value = true
    activeMember.value = ((activeMember.value % n) + n) % n + n
    requestAnimationFrame(() => requestAnimationFrame(() => (instant.value = false)))
  }
}

/* On n'affiche que le membre actif et ses deux voisins directs. */
const visibleMembers = computed(() => {
  if (!team.value.length) return new Set()
  const a = activeMember.value
  return new Set([a - 1, a, a + 1])
})

const waLink = computed(() =>
  whatsappLink(
    settings.value.whatsapp || settings.value.phone1,
    t('devis.waMessage'),
  ),
)

/* Bloc contact de fin de page : mêmes tuiles que la page Contact. */

onMounted(async () => {
  load()
  loadSettings()
  heroTimer = setInterval(() => {
    heroBgIndex.value = (heroBgIndex.value + 1) % HERO_BACKGROUNDS.length
  }, 5000)
  try {
    const { getTeam } = await import('@/lib/api')
    team.value = await getTeam()
    /* On démarre dans la copie du milieu pour avoir un voisin de chaque côté. */
    activeMember.value = team.value.length
    startTeamAutoplay()
  } catch (err) {
    console.error('[team]', err)
  }
})

onBeforeUnmount(() => {
  if (heroTimer) clearInterval(heroTimer)
  stopTeamAutoplay()
})
</script>

<template>
  <div>
    <section class="hero">
      <div class="hero__bg" aria-hidden="true">
        <img
          v-for="(bg, i) in HERO_BACKGROUNDS"
          :key="bg"
          :src="bg"
          alt=""
          :class="{ 'is-active': i === heroBgIndex }"
        />
      </div>
      <div class="container">
        <div class="hero__grid">
          <div>
            <span class="eyebrow">{{ t('home.heroEyebrow') }}</span>
            <h1>{{ typedTagline }}</h1>
            <p>{{ t('home.intro') }}</p>
            <div class="hero__actions">
              <a :href="waLink" target="_blank" rel="noopener" class="btn btn--ghost">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" style="vertical-align: middle; margin-right: 6px;">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {{ t('home.whatsapp') }}
              </a>
            </div>
          </div>

          <aside class="hero__panel">
            <h3>{{ t('home.panelTitle') }}</h3>
            <ul class="hero__list">
              <li v-for="trade in heroTrades" :key="trade.label">
                <span aria-hidden="true">{{ trade.icon }}</span>
                {{ trade.label }}
              </li>
            </ul>
          </aside>
        </div>

        <PwaInstallCard />
      </div>
    </section>

    <section id="services" class="section section--alt">
      <div class="container">
        <SectionHeading
          :eyebrow="t('home.domainsEyebrow')"
          :title="t('home.domainsTitle')"
          :text="t('home.domainsText')"
        />

        <div v-if="loading && !services.length" class="grid grid--3">
          <div v-for="n in 6" :key="n" class="skeleton" />
        </div>
        <div v-else class="grid grid--3 services-grid" :class="{ 'is-collapsed': !servicesExpanded }">
          <ServiceCard v-for="service in highlights" :key="service.id" :service="service" />
        </div>

        <button
          v-if="highlights.length > 1"
          class="btn btn--outline services-toggle"
          type="button"
          @click="servicesExpanded = !servicesExpanded"
        >
          {{ servicesExpanded ? t('home.showLess') : t('home.showMore') }}
        </button>

        <div class="row mt-lg">
          <RouterLink :to="{ name: 'realisations' }" class="btn btn--dark">
            {{ t('home.realisationsCta') }}
          </RouterLink>
        </div>
      </div>
    </section>

    <section id="equipe" class="section">
      <div class="container">
        <SectionHeading
          :eyebrow="t('team.eyebrow')"
          :title="t('team.title')"
          :text="t('team.text')"
          center
        />

        <div v-if="!team.length" class="empty">
          {{ t('team.empty') }}
        </div>

        <div
          v-else
          class="team-carousel"
          @mouseenter="stopTeamAutoplay"
          @mouseleave="startTeamAutoplay"
          @focusin="stopTeamAutoplay"
          @focusout="startTeamAutoplay"
        >
          <button
            class="team-carousel__arrow"
            type="button"
            aria-label="Membre précédent"
            @click="prevMember"
          >
            ‹
          </button>

          <div class="team-carousel__viewport">
            <div
              class="team-carousel__track"
              :class="{ 'is-instant': instant }"
              :style="{ '--active': activeMember }"
              @transitionend.self="onTrackTransitionEnd"
            >
              <article
                v-for="(member, i) in loopMembers"
                :key="`${member.id}-${i}`"
                class="team-slide"
                :class="{ 'is-active': i === activeMember, 'is-hidden': !visibleMembers.has(i) }"
                @click="selectMember(i)"
              >
                <div v-if="member.photo" class="team-card__photo">
                  <img :src="member.photo" :alt="member.name" />
                </div>
                <div v-else class="team-card__avatar">
                  {{ member.name?.charAt(0).toUpperCase() }}
                </div>
                <h3>{{ member.name }}</h3>
                <p class="team-card__role">{{ member.role }}</p>
                <p class="muted small">{{ member.bio }}</p>
              </article>
            </div>
          </div>

          <button
            class="team-carousel__arrow"
            type="button"
            aria-label="Membre suivant"
            @click="nextMember"
          >
            ›
          </button>
        </div>
      </div>
    </section>

    <ContactSection />
  </div>
</template>