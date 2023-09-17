import Vue from '../../../dist/vue'
import App from './App.vue'

// Vue.mixin({
//   beforeCreate () {
//     console.log('Vue.mixin beforeCreate')
//   },
//   created () {
//     console.log('Vue.mixin created')
//   },
//   beforeUpdate () {
//     console.log('Vue.mixin beforeUpdate')
//   },
//   updated () {
//     console.log('Vue.mixin updated')
//   },
//   beforeMount () {
//     console.log('Vue.mixin beforeMount')
//   },
//   mounted () {
//     console.log('Vue.mixin mounted')
//   }
// })

new Vue({
  el: '#app',
  render: h => h(App),
  beforeCreate () {
    console.log('new Vue beforeCreate')
  },
  created () {
    console.log('new Vue created')
  },
  beforeUpdate () {
    console.log('new Vue beforeUpdate')
  },
  updated () {
    console.log('new Vue updated')
  },
  beforeMount () {
    console.log('new Vue beforeMount')
  },
  mounted () {
    console.log('new Vue mounted')
  }
})