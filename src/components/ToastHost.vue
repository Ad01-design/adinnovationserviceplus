<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toast-host" aria-live="polite">
    <TransitionGroup name="fade">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`">
        <span>{{ toast.message }}</span>
        <button type="button" aria-label="Fermer" @click="dismiss(toast.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>
