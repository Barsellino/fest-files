<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { parseProtocolFile } from '../api/parseProtocolFile.js'
import { useProtocolStore } from '../stores/protocol.js'

const protocol = useProtocolStore()

const fileInput = ref(null)
const customUrl = ref(
  typeof import.meta.env.VITE_PROTOCOL_PARSE_URL === 'string'
    ? import.meta.env.VITE_PROTOCOL_PARSE_URL
    : '',
)
const apiKey = ref(
  typeof import.meta.env.VITE_PROTOCOL_PARSE_API_KEY === 'string'
    ? import.meta.env.VITE_PROTOCOL_PARSE_API_KEY
    : '',
)

const loading = ref(false)
const error = ref('')
const success = ref('')

async function onSubmit() {
  error.value = ''
  success.value = ''
  const input = fileInput.value
  if (!input?.files?.length) {
    error.value = 'Оберіть файл (PDF або JSON — залежно від вашого API).'
    return
  }
  const file = input.files[0]
  loading.value = true
  try {
    const json = await parseProtocolFile({
      file,
      endpoint: customUrl.value || undefined,
      apiKey: apiKey.value || undefined,
    })
    protocol.setFromParsed(json)
    success.value = 'Протокол оновлено з відповіді API.'
    input.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function onResetBundled() {
  error.value = ''
  success.value = ''
  protocol.resetToBundled()
  success.value =
    'Повернуто вбудований мок для поточної вкладки (Strip Beginners / Middle / Skilled або Best Ladies Show).'
}
</script>

<template>
  <section class="api-loader" aria-label="Завантаження протоколу через API">
    <h2 class="api-loader__title">Парсинг файлу через API</h2>
    <p class="api-loader__hint">
      Ваш сервер приймає файл і повертає JSON у тому ж форматі, що
      <code>src/data/protocol.json</code>. URL і ключ (лише для тесту) можна задати в
      <code>.env</code> або нижче.
    </p>

    <div class="api-loader__row">
      <label class="api-loader__label" for="proto-url">URL API</label>
      <InputText
        id="proto-url"
        v-model="customUrl"
        class="api-loader__input"
        placeholder="https://…/parse-protocol"
        type="url"
        autocomplete="off"
      />
    </div>

    <div class="api-loader__row">
      <label class="api-loader__label" for="proto-key">Ключ (опційно)</label>
      <InputText
        id="proto-key"
        v-model="apiKey"
        class="api-loader__input"
        placeholder="Bearer для тесту — не для публічного продакшену"
        type="password"
        autocomplete="off"
      />
    </div>

    <div class="api-loader__row api-loader__row--file">
      <label class="api-loader__label" for="proto-file">Файл</label>
      <input
        id="proto-file"
        ref="fileInput"
        class="api-loader__file"
        type="file"
        accept=".pdf,.json,application/pdf,application/json"
      />
    </div>

    <p v-if="loading" class="api-loader__loading" role="status" aria-live="polite">
      Запит виконується… Якщо на бекенді увімкнено OpenAI, великий PDF може оброблятися
      <strong>1–3 хвилини</strong> — зачекайте, не закривайте вкладку.
    </p>

    <div class="api-loader__actions">
      <Button
        type="button"
        label="Надіслати й застосувати"
        :loading="loading"
        @click="onSubmit"
      />
      <Button
        type="button"
        label="Скинути до вбудованого"
        severity="secondary"
        outlined
        :disabled="loading"
        @click="onResetBundled"
      />
    </div>

    <Message v-if="error" severity="error" :closable="false" class="api-loader__msg">
      {{ error }}
    </Message>
    <Message
      v-if="success"
      severity="success"
      :closable="false"
      class="api-loader__msg"
    >
      {{ success }}
    </Message>
  </section>
</template>

<style scoped>
.api-loader {
  margin-bottom: 1.25rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.api-loader__title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #1e1b2e;
}

.api-loader__hint {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: #5a5670;
}

.api-loader__hint code {
  font-size: 0.75em;
  word-break: break-all;
}

.api-loader__row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.api-loader__row--file {
  margin-bottom: 1rem;
}

.api-loader__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #3d3a50;
}

.api-loader__input {
  width: 100%;
}

.api-loader__file {
  width: 100%;
  font-size: 0.875rem;
}

.api-loader__loading {
  margin: 0 0 0.75rem;
  padding: 0.65rem 0.75rem;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: #4338ca;
  background: rgba(99, 102, 241, 0.12);
  border-radius: 0.5rem;
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.api-loader__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.api-loader__msg {
  margin-top: 0.5rem;
}
</style>
