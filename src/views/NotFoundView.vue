<script setup>
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>

<template>
  <section class="section">
    <div class="container center">
      <span class="eyebrow">{{ t('notFound.eyebrow') }}</span>
      <h1>{{ t('notFound.title') }}</h1>
      <p class="lead">{{ t('notFound.text') }}</p>
      <div class="row center-row">
        <RouterLink to="/" class="btn btn--dark">{{ t('notFound.home') }}</RouterLink>
        <RouterLink :to="{ name: 'accueil', hash: '#services' }" class="btn btn--outline">
          {{ t('notFound.services') }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>
