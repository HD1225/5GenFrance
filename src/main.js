import { createApp } from 'vue'
import { ElSelect } from 'element-plus'
import App from './App.vue'
import 'element-plus/dist/index.css';

createApp(App)
    .use(ElSelect)
    .mount('#app')