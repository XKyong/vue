import Vue from '../../../dist/vue'
import App from './App.vue'

// 官网链接：https://v2.cn.vuejs.org/v2/guide/components-dynamic-async.html#%E5%BC%82%E6%AD%A5%E7%BB%84%E4%BB%B6

// 异步组件注册方式1：工厂函数
// eslint-disable-next-line
// Vue.component('HelloWorld', function (resolve, reject) {
//   // 这个特殊的 require 语法告诉 webpack
//   // 自动将编译后的代码分割为不同的 chunk 
//   // 执行时会发送网络请求，网络响应成功后会执行这里传入的第 2 个回调函数
//   require(['./components/HelloWorld'], function (res) {
//     resolve(res)
//   })
// })

// 异步组件注册方式2：import() 语法
// Vue.component(
//   'HelloWorld', 
//   // 该 `import` 函数返回一个 Promise 对象
//   () => import('./components/HelloWorld')
// )

// 异步组件注册方式3：对象配置
const LoadingComp = {
  template: '<div>loading</div>'
}

const ErrorComp = {
  template: '<div>error</div>'
}

const AsyncComp = () => ({
  // 需要加载的组件 (应该是一个 `Promise` 对象)
  component: import('./components/HelloWorld'),
  // 异步组件加载时使用的组件
  loading: LoadingComp,
  // 加载失败时使用的组件
  error: ErrorComp,
  // 说明：network 面板中把带宽调小测试效果更明显！
  // 展示 加载时组件 的延时时间。默认值是 200 (毫秒)
  // 即到了该延时时间才出现 loading 属性对应的组件，如果 component 属性对应的组件请求在该 延时时间 内响应回来了，则 加载时组件 不会出现在页面上！
  delay: 200,
  // 如果提供了超时时间且 component 属性对应组件加载也超时了，则使用加载失败时使用的error属性对应组件。
  // 默认值是：`Infinity`，即等价于不传入 timeout 属性
  // 如果要让该 AsyncComp 最终显示为 ErrorComp，则可以在 network 面板中设置“Slow 3G”
  timeout: 3000
})

Vue.component('HelloWorld', AsyncComp)

new Vue({
  el: '#app',
  render: h => h(App)
}) 