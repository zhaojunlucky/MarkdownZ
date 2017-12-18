import Vue from 'vue'
import axios from 'axios'
import marked from 'marked'
import moment from 'moment'

import App from './App'
import router from './router'
import store from './store' 

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.filter('date', time=>moment(time).format('DD/MM/YY, HH:mm'))
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
