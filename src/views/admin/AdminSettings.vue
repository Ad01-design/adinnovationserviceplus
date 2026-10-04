<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useSettings } from '@/composables/useSettings'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'

const { raw, load, update } = useSettings()
const { success, error } = useToast()
const { t } = useI18n()

const form = reactive({})
const saving = ref(false)

watch(
  raw,
  (value) => {
    Object.assign(form, value)
  },
  { immediate: true, deep: true },
)

async function save() {
  saving.value = true
  try {
    await update({ ...form })
    success(t('admin.toastSettingsOk'))
  } catch (err) {
    error(t('admin.toastSettingsFail', { error: err.message }))
  } finally {
    saving.value = false
  }
}

onMounted(() => load(true))
</script>

<template>
  <div>
    <div class="admin__topbar">
      <div>
        <h1 class="admin__title">{{ t('admin.settingsTitle') }}</h1>
        <p class="admin__sub">{{ t('admin.settingsSub') }}</p>
      </div>
      <button class="btn btn--primary btn--sm" type="button" :disabled="saving" @click="save">
        {{ saving ? t('common.saving') : t('common.save') }}
      </button>
    </div>

    <div class="panel">
      <div class="panel__head"><h3>{{ t('admin.blockIdentity') }}</h3></div>
      <div class="panel__body form">
        <div class="field">
          <label for="set-brand">{{ t('admin.fieldBrandName') }}</label>
          <input id="set-brand" v-model="form.brand_name" class="input" type="text" />
        </div>
        <div class="field">
          <label for="set-tagline">{{ t('admin.fieldTagline') }}</label>
          <input id="set-tagline" v-model="form.tagline" class="input" type="text" />
        </div>
        <div class="field">
          <label for="set-about">{{ t('admin.fieldAbout') }}</label>
          <textarea id="set-about" v-model="form.about" class="textarea" />
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel__head"><h3>{{ t('admin.blockContact') }}</h3></div>
      <div class="panel__body form">
        <div class="form-grid">
          <div class="field">
            <label for="set-phone1">{{ t('admin.fieldPhone1') }}</label>
            <input id="set-phone1" v-model="form.phone1" class="input" type="text" />
          </div>
          <div class="field">
            <label for="set-phone2">{{ t('admin.fieldPhone2') }}</label>
            <input id="set-phone2" v-model="form.phone2" class="input" type="text" />
          </div>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="set-phone3">{{ t('admin.fieldPhone3') }}</label>
            <input id="set-phone3" v-model="form.phone3" class="input" type="text" />
          </div>
          <div class="field">
            <label for="set-whatsapp">{{ t('admin.fieldWhatsapp') }}</label>
            <input id="set-whatsapp" v-model="form.whatsapp" class="input" type="text" />
            <span class="hint">{{ t('admin.fieldWhatsappHint') }}</span>
          </div>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="set-email">{{ t('contact.email') }}</label>
            <input id="set-email" v-model="form.email" class="input" type="email" />
          </div>
          <div class="field">
            <label for="set-hours">{{ t('admin.fieldHours') }}</label>
            <input id="set-hours" v-model="form.hours" class="input" type="text" />
          </div>
        </div>
        <div class="field">
          <label for="set-address">{{ t('admin.fieldAddress') }}</label>
          <input id="set-address" v-model="form.address" class="input" type="text" />
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel__head"><h3>{{ t('admin.blockSocial') }}</h3></div>
      <div class="panel__body form">
        <div class="form-grid">
          <div class="field">
            <label for="set-facebook">Facebook</label>
            <input id="set-facebook" v-model="form.facebook" class="input" type="url" />
          </div>
          <div class="field">
            <label for="set-tiktok">TikTok</label>
            <input id="set-tiktok" v-model="form.tiktok" class="input" type="url" />
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <button class="btn btn--primary" type="button" :disabled="saving" @click="save">
        {{ saving ? t('common.saving') : t('admin.saveSettings') }}
      </button>
      <RouterLink to="/" class="btn btn--outline">{{ t('admin.seeResult') }}</RouterLink>
    </div>
  </div>
</template>
