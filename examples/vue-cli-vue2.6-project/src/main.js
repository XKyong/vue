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