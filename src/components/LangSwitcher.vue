<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from '@/i18n'

const { locale, locales, setLocale, t } = useI18n()

const open = ref(false)
const root = ref(null)

const current = computed(() => locales.find((item) => item.code === locale.value) || locales[0])

function onDocumentClick(event) {
  if (root.value && !root.value.contains(event.target)) open.value = false
}

function pick(code) {
  setLocale(code)
  open.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="root" class="lang-switch">
    <button
      class="lang-switch__btn"
      type="button"
      :aria-expanded="open"
      :aria-label="t('nav.language')"
      @click="open = !open"
    >
      <span aria-hidden="true">🌐</span>
      <span>{{ current.short }}</span>
      <span class="lang-switch__caret" aria-hidden="true">▾</span>
    </button>

    <ul v-if="open" class="lang-switch__menu" role="menu">
      <li v-for="item in locales" :key="item.code">
        <button
          type="button"
          role="menuitem"
          :class="{ 'is-active': item.code === locale }"
          @click="pick(item.code)"
        >
          <span aria-hidden="true">{{ item.flag }}</span>
          {{ item.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
