import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import pyodideWorker from './plugins/pyodideWorker'


const pinia = createPinia()


createApp(App).use(pyodideWorker).use(pinia).mount('#app')

