import Vue from '../../../dist/vue'
import App from './App.vue'

// 全局注册组件
Vue.component('app', App)

new Vue({
  el: '#app',
  template: '<app></app>'
})