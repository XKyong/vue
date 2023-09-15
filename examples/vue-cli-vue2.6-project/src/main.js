// import Vue from 'vue'
// 这里将 Vue 的 引用位置指向源码中的位置，因此能够享受到 SourceMap 带来的代码调试体验！
// 07-createComponent 和 08-patch 示例------------------------
// import Vue from '../../../dist/vue'
// import App from './App.vue'

// Vue.config.productionTip = false

// new Vue({
//   el: '#app',
//   render: h => h(App),
// })

// 09-merge-config 示例------------------------
import Vue from '../../../dist/vue'

let childComp = {
  name: 'childComp',
  template: '<div>{{msg}}</div>',
  created() {
    console.log('child created')
  },
  mounted() {
    console.log('child mounted')
  },
  data() {
    return {
      msg: 'Hello Vue'
    }
  }
}

Vue.mixin({
  created() {
    console.log('parent created')
  }
})

new Vue({
  el: '#app',
  render: h => h(childComp)
})