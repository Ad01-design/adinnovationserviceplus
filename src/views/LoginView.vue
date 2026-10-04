<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSettings } from '@/composables/useSettings'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'

const route = useRoute()
const router = useRouter()
const { login, init, isAuthenticated } = useAuth()
const { settings, load } = useSettings()
const { success, error } = useToast()
const { t } = useI18n()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const showPassword = ref(false)

const redirectTarget = () =>
  typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'

async function submit() {
  loading.value = true
  try {
    await login(form.email.trim(), form.password)
    success(t('login.ok'))
    router.replace(redirectTarget())
  } catch (err) {
    error(err.message)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  load()
  await init()
  if (isAuthenticated.value) router.replace(redirectTarget())
})
</script>

<template>
  <div class="auth">
    <div class="auth__card">
      <RouterLink to="/" class="auth__close" :aria-label="t('login.back')">
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

      <h1 class="auth__title">Welcome Back</h1>

      <form class="form" novalidate @submit.prevent="submit">
        <div class="field">
          <label class="sr-only" for="l-email">{{ t('login.email') }}</label>
          <input
            id="l-email"
            v-model="form.email"
            class="input auth__input"
            type="email"
            autocomplete="email"
            :placeholder="t('login.email')"
          />
        </div>

        <div class="field">
          <label class="sr-only" for="l-password">{{ t('login.password') }}</label>
          <div class="auth__password">
            <input
              id="l-password"
              v-model="form.password"
              class="input auth__input"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
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
          Login
        </button>
      </form>

      <a class="auth__forgot" :href="`mailto:${settings.email}`">Forgot Password?</a>

      <p class="auth__alt">
        <span>Don’t have an account?</span>
        <RouterLink to="/inscription">Sign Up</RouterLink>
      </p>
    </div>
  </div>
</template>
