<script setup>
import { computed, onMounted, ref } from 'vue'
import ModalDialog from '@/components/ModalDialog.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { useI18n } from '@/i18n'

const realisations = ref([])
const loading = ref(true)
const activeCategory = ref('')
const zoomed = ref(null)
const { t } = useI18n()

onMounted(async () => {
  try {
    const { getRealisations } = await import('@/lib/api')
    realisations.value = await getRealisations()
  } catch (err) {
    console.error('[realisations]', err)
  } finally {
    loading.value = false
  }
})

/* Filtres : une puce par catégorie, plus « tout voir ». */
const categories = computed(() => {
  const seen = new Set()
  realisations.value.forEach((item) => {
    if (item.category) seen.add(item.category)
  })
  return [...seen].sort()
})

const filtered = computed(() =>
  activeCategory.value
    ? realisations.value.filter((item) => item.category === activeCategory.value)
    : realisations.value,
)

function countIn(category) {
  return realisations.value.filter((item) => item.category === category).length
}

const initial = (item) => item.title?.charAt(0).toUpperCase()
</script>

<template>
  <div>
    <section class="section">
      <div class="container">
        <SectionHeading
          :eyebrow="t('realisations.eyebrow')"
          :title="t('realisations.title')"
          :text="t('realisations.text')"
          center
        />

        <div v-if="loading" class="realisations-grid">
          <div v-for="n in 3" :key="n" class="skeleton realisations-skeleton" />
        </div>

        <div v-else-if="!realisations.length" class="empty">
          {{ t('realisations.empty') }}
        </div>

        <template v-else>
          <div v-if="categories.length > 1" class="realisations-filters">
            <button
              type="button"
              class="chip"
              :class="{ 'is-active': !activeCategory }"
              @click="activeCategory = ''"
            >
              {{ t('realisations.all') }} ({{ realisations.length }})
            </button>
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              class="chip"
              :class="{ 'is-active': activeCategory === category }"
              @click="activeCategory = activeCategory === category ? '' : category"
            >
              {{ category }} ({{ countIn(category) }})
            </button>
          </div>

          <div class="realisations-grid">
            <article
              v-for="realisation in filtered"
              :key="realisation.id"
              class="card card--interactive realisation-card"
            >
              <button
                v-if="realisation.image"
                type="button"
                class="realisation-card__media"
                :aria-label="t('realisations.zoom')"
                @click="zoomed = realisation"
              >
                <img :src="realisation.image" :alt="realisation.title" />
                <span v-if="realisation.category" class="badge badge--gold realisation-card__tag">
                  {{ realisation.category }}
                </span>
              </button>
              <div v-else class="realisation-card__placeholder">
                <span>{{ initial(realisation) }}</span>
                <span v-if="realisation.category" class="badge badge--gold realisation-card__tag">
                  {{ realisation.category }}
                </span>
              </div>

              <div class="realisation-card__body">
                <h3>{{ realisation.title }}</h3>
                <p class="muted small">{{ realisation.description }}</p>
              </div>
            </article>
          </div>
        </template>
      </div>
    </section>

    <!-- Agrandissement de l'image au clic -->
    <ModalDialog :open="Boolean(zoomed)" :title="zoomed?.title ?? ''" @close="zoomed = null">
      <img v-if="zoomed?.image" class="realisation-zoom" :src="zoomed.image" :alt="zoomed.title" />
    </ModalDialog>
  </div>
</template>
