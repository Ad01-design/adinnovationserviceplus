<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'

const router = useRouter()
const { register, init, isAuthenticated } = useAuth()
const { success, error, info } = useToast()
const { t } = useI18n()

const form = reactive({ fullName: '', email: '', password: '' })
const loading = ref(false)
const showPassword = ref(false)

async function submit() {
  if (!form.fullName.trim()) {
    error('Please enter your full name.')
    return
  }

  loading.value = true
  try {
    const session = await register(form.fullName.trim(), form.email.trim(), form.password)

    // Sans session, Supabase attend la confirmation de l'e-mail.
    if (session) {
      success('Account created. Welcome!')
      router.replace('/admin')
    } else {
      info('Check your inbox to confirm your email address, then log in.')
      router.replace({ name: 'connexion' })
    }
  } catch (err) {
    error(err.message)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await init()
  if (isAuthenticated.value) router.replace('/admin')
})
</script>

<template>
  <div class="auth">
    <div class="auth__card">
      <RouterLink to="/" class="auth__close" aria-label="Close">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2.6"
            stroke-linecap="round"
          />
        </svg>
      </RouterLink>

      <h1 class="auth__title">Create Account</h1>

      <form class="form" novalidate @submit.prevent="submit">
        <div class="field">
          <label class="sr-only" for="s-name">Full Name</label>
          <input
            id="s-name"
            v-model="form.fullName"
            class="input auth__input auth__input--plain"
            type="text"
            autocomplete="name"
            placeholder="Full Name"
          />
        </div>

        <div class="field">
          <label class="sr-only" for="s-email">{{ t('login.email') }}</label>
          <input
            id="s-email"
            v-model="form.email"
            class="input auth__input"
            type="email"
            autocomplete="email"
            :placeholder="t('login.email')"
          />
        </div>

        <div class="field">
          <label class="sr-only" for="s-password">{{ t('login.password') }}</label>
          <div class="auth__password">
            <input
              id="s-password"
              v-model="form.password"
              class="input auth__input"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :placeholder="t('login.password')"
            />
            <button
              type="button"
              class="auth__eye"
              :aria-label="t('login.password')"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <g
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M2.6 12S6.2 5.6 12 5.6 21.4 12 21.4 12 17.8 18.4 12 18.4 2.6 12 2.6 12Z" />
                  <circle cx="12" cy="12" r="3.2" />
                </g>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <g
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M10.2 5.9A11.2 11.2 0 0 1 12 5.6c5.8 0 9.4 6.4 9.4 6.4a17.4 17.4 0 0 1-3.3 4"
                  />
                  <path d="M6.6 7.3A17.4 17.4 0 0 0 2.6 12s3.6 6.4 9.4 6.4a11.2 11.2 0 0 0 3.5-.6" />
                  <path d="M9.9 9.9a3.2 3.2 0 0 0 4.4 4.4" />
                  <path d="m3.6 3.6 16.8 16.8" />
                </g>
              </svg>
            </button>
          </div>
        </div>

        <button class="btn btn--block auth__submit" type="submit" :disabled="loading">
          <span v-if="loading" class="spinner" aria-hidden="true" />
          Sign Up
        </button>
      </form>

      <p class="auth__alt">
        <span>Already have an account?</span>
        <RouterLink to="/connexion">Login</RouterLink>
      </p>
    </div>
  </div>
</template>
