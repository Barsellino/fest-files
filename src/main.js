import { createApp } from 'vue'
import './styles/app.css'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    // Не слідувати системній темній темі (інакше компоненти темні на світлому фоні).
    options: {
      darkModeSelector: '.app-use-dark-prime',
    },
  },
})

app.mount('#app')
