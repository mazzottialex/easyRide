import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/js/bootstrap"
//import { createPinia } from 'pinia'
import { createApp } from 'vue'
import axios from 'axios'
import App from './App.vue'
import router from './routes/router.js'

axios.defaults.withCredentials = true

createApp(App)
    .use(router)
    //.use(createPinia())
    .mount('#app')
