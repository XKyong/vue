/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  /*initMixin就做了一件事情，在Vue的原型上增加_init方法，构造Vue实例的时候会调用这个_init方法来初始化Vue实例*/
  // 给Vue的原型上添加 _init 方法
  // 合并 options / 初始化操作
  // 这里的 options 就是业务代码传入 Vue 构造函数的参数！
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    // 唯一标识符
    vm._uid = uid++

    // 开发环境下性能检测相关 ------------------------
    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }
    // ----------------------------------------------

    // a flag to avoid this being observed
    // 如果是 Vue 实例，则不需要被 observe
    /*一个防止vm实例自身被观察的标志位*/
    vm._isVue = true
    // merge options
    // 将用户传入的options与Vue本身实例化过程中创建的options进行合并
    if (options && options._isComponent) {
      // 传入的是组件实例而非 DOM 元素，比如 examples/vue-cli-vue2.6-project 例子传入的 App 组件就会来到这
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      // 往 vm 上挂载 $options 对象，后续的代码逻辑针对的是 $options 对象了！
      // $options 上有的东西如：
      // {"components":{},"directives":{},"filters":{},"el":"#app","created":[null]}'
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }

    // 渲染时才会用到这里的 _renderProxy 方法 
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // vm 的生命周期相关变量的初始化：$parent/$children/$refs/$root
    initLifecycle(vm)
    // vm 的事件监听初始化，父组件绑定在当前组件上的事件
    initEvents(vm)
    // vm 的编译render初始化
    // $slots/$scopedSlots/_c/$createElement/$attrs/$listeners
    initRender(vm)
    // beforeCreate 生命函数钩子的回调
    callHook(vm, 'beforeCreate')
    // 把 inject 的成员注入到 vm 上
    // 与下边的 initProvide 是一对, 用于实现组件之间的依赖注入
    initInjections(vm) // resolve injections before data/props
    // 初始化 vm 的 _props/methods/_data/computed/watch
    initState(vm)
    // 初始化 provide, 需要在加载完 data/props 之后才初始化 provide
    initProvide(vm) // resolve provide after data/props
    // created 生命函数钩子的回调
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    // 对于传入的是组件实例，则 vm.$mount 不会被执行，比如 examples/vue-cli-vue2.6-project 例子传入的 App 组件
    // 组件的 $mount 在 src\core\vdom\create-component.js 中的 componentVNodeHooks.init 钩子函数中
    if (vm.$options.el) {
      /*挂载组件*/
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  // 存储占位符 VNode 实例
  const parentVnode = options._parentVnode
  // 存储当前 vm 实例
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  /*如果存在父类的时候*/
  if (Ctor.super) {
    /*对其父类进行resolveConstructorOptions，获取父类的options*/
    const superOptions = resolveConstructorOptions(Ctor.super)
    /*之前已经缓存起来的父类的options，用以检测是否更新*/
    const cachedSuperOptions = Ctor.superOptions
    /*对比当前父类的option以及缓存中的option，两个不一样则代表已经被更新*/
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      /*父类的opiton已经被改变，需要去处理新的option*/

      /*把新的option缓存起来*/
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
