import Vue from 'vue'
import Antd from 'ant-design-vue';
import VueCookies from 'vue-cookies';
import App from './App.vue';
import 'ant-design-vue/dist/antd.css';

Vue.config.productionTip = false
Vue.use(Antd)
Vue.use(VueCookies)
new Vue({
  render: h => h(App),
}).$mount('#app')
