import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 此处不使用 class 是为了后续方便给 Vue 实例混入实例成员，表现为方便往Vue的prototype上添加方法或者属性
// 不是说使用 class 不行，而是如此使用后会显得代码风格不是很一致（Vue 类 和 Vue.prototype 用法）
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 这里调用的 _init 方法是下边initMixin方法生成的
  this._init(options)
}

// 以下方法的执行，在 import Vue from 'vue' 执行过程中就会执行了！
// 注册 vm 的 _init 方法，初始化 vm
initMixin(Vue)
// 注册 vm 的 $data/$props/$set/$delete/$watch
stateMixin(Vue)
// 初始化事件相关的方法：$on/$once/$off/$emit
eventsMixin(Vue)
// 初始化生命周期相关的混入方法
// _update/$forceUpdate/$destroy
lifecycleMixin(Vue)
// 混入 render：$nextTick/_render
renderMixin(Vue)

export default Vue
