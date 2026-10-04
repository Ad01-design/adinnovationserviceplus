<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { useSettings } from '@/composables/useSettings'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'
import { createMessage } from '@/lib/api'
import contact1 from '@/assets/contact-1.jpg'
import contact2 from '@/assets/contact-2.jpg'
import contact3 from '@/assets/contact-3.jpg'
import contact4 from '@/assets/contact-4.jpg'
import contact5 from '@/assets/contact-5.jpg'
import contact6 from '@/assets/contact-6.jpg'
import contact7 from '@/assets/contact-7.jpg'

const { settings, load } = useSettings()
const { success, error } = useToast()
const { t } = useI18n()

const form = reactive({ name: '', phone: '', message: '' })
const errors = reactive({})
const sending = ref(false)
const sent = ref(false)

const slides = [contact1, contact2, contact3, contact4, contact5, contact6, contact7]
const currentSlide = ref(0)
let slideInterval = null

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

function startSlideshow() {
  slideInterval = setInterval(nextSlide, 5000)
}

function stopSlideshow() {
  if (slideInterval) {
    clearInterval(slideInterval)
    slideInterval = null
  }
}

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key])
  if (!form.name.trim()) errors.name = t('contact.errName')
  if (!form.phone.trim()) errors.phone = t('contact.errPhone')
  if (form.message.trim().length < 10) {
    errors.message = t('contact.errMessage')
  }
  return Object.keys(errors).length === 0
}

async function submit() {
  if (!validate()) return
  sending.value = true
  try {
    await createMessage({ ...form })
    Object.assign(form, { name: '', phone: '', message: '' })
    sent.value = true
    success(t('contact.toastOk'))
  } catch (err) {
    error(t('contact.toastFail', { error: err.message }))
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  load()
  startSlideshow()
})

onUnmounted(() => {
  stopSlideshow()
})
</script>

<template>
  <section id="contact" class="section">
    <div class="container">
      <SectionHeading
        :eyebrow="t('contact.eyebrow')"
        :title="t('contact.title')"
        :text="t('contact.text')"
      />

      <div class="two-col">
        <div class="card">
          <div v-if="sent" class="alert alert--success">{{ t('contact.sent') }}</div>

          <form class="form" novalidate @submit.prevent="submit">
            <div class="form-grid">
              <div class="field">
                <label for="c-name">{{ t('contact.name') }} *</label>
                <input
                  id="c-name"
                  v-model="form.name"
                  class="input"
                  type="text"
                  autocomplete="name"
                />
                <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
              </div>
              <div class="field">
                <label for="c-phone">{{ t('contact.phone') }} *</label>
                <input
                  id="c-phone"
                  v-model="form.phone"
                  class="input"
                  type="tel"
                  autocomplete="tel"
                />
                <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
              </div>
            </div>

            <div class="field">
              <label for="c-message">{{ t('contact.message') }} *</label>
              <textarea id="c-message" v-model="form.message" class="textarea" />
              <span v-if="errors.message" class="field-error">{{ errors.message }}</span>
            </div>

            <div class="row">
              <button class="btn btn--primary" type="submit" :disabled="sending">
                <span v-if="sending" class="spinner spinner--dark" aria-hidden="true" />
                {{ sending ? t('contact.sending') : t('contact.submit') }}
              </button>
              <span class="small muted">{{ t('contact.note') }}</span>
            </div>
          </form>
        </div>

        <div class="contact-aside">
          <div class="contact-slideshow">
            <img
              v-for="(slide, index) in slides"
              :key="index"
              class="contact-slideshow__slide"
              :class="{ 'contact-slideshow__slide--active': index === currentSlide }"
              :src="slide"
              :alt="`${settings.brand_name} - Photo ${index + 1}`"
              loading="lazy"
            />
          </div>
          <p class="contact-aside__text">{{ t('home.intro') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-slideshow {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.contact-slideshow__slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.contact-slideshow__slide--active {
  opacity: 1;
}
</style>