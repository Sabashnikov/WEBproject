import Vue from 'vue'
import App from './App.vue'
import router from './router' // Импортируем router из отдельного файла

Vue.config.productionTip = false

new Vue({
  router, // Добавляем router в экземпляр Vue
  render: h => h(App),
}).$mount('#app')
