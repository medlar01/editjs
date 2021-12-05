import Vue from 'vue'
import Antd from 'ant-design-vue';
import VueCookies from 'vue-cookies';
import App from './App.vue';
import 'ant-design-vue/dist/antd.css';
import httpLoader from 'http-vue-loader'
Vue.config.productionTip = false
Vue.use(Antd)
Vue.use(VueCookies)
Vue.use(httpLoader)
new Vue({
  render: h => h(App),
}).$mount('#app')
