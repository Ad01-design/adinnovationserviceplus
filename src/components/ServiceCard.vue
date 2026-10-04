<script setup>
import { useI18n } from '@/i18n'

const { t } = useI18n()

defineProps({
  service: { type: Object, required: true },
})
</script>

<template>
  <article class="card card--interactive service-card">
    <div class="service-card__icon" aria-hidden="true">{{ service.icon }}</div>
    <h3 class="service-card__title">{{ service.title }}</h3>
    <p class="service-card__text">{{ service.description }}</p>
    <div class="service-card__foot">
      <span class="badge">{{ service.category }}</span>
    </div>
  </article>
</template>