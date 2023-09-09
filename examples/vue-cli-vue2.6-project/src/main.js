// import Vue from 'vue'
// 这里将 Vue 的 引用位置指向源码中的位置，因此能够享受到 SourceMap 带来的代码调试体验！
import Vue from '../../../dist/vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  el: '#app',
  render: h => h(App),
})
