import { computed, ref } from 'vue'
import * as api from '@/lib/api'

const session = ref(null)
const ready = ref(false)

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(session.value))

  async function init() {
    if (ready.value) return session.value
    session.value = await api.getSession()
    api.onAuthStateChange((next) => {
      session.value = next
    })
    ready.value = true
    return session.value
  }

  async function login(email, password) {
    session.value = await api.signIn(email, password)
    ready.value = true
    return session.value
  }

  async function register(fullName, email, password) {
    const next = await api.signUp(fullName, email, password)
    // Si la confirmation par e-mail est activée, il n'y a pas encore de session.
    if (next) {
      session.value = next
      ready.value = true
    }
    return next
  }

  async function logout() {
    await api.signOut()
    session.value = null
  }

  return { session, ready, isAuthenticated, init, login, register, logout }
}
