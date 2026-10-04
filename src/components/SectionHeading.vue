<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  text: { type: String, default: '' },
  center: { type: Boolean, default: false },
})
</script>

<template>
  <div class="section-head" :class="{ 'section-head--center': center }">
    <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
    <h2>{{ title }}</h2>
    <p v-if="text" class="lead">{{ text }}</p>
  </div>
</template>
