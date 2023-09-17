/* @flow */

import {
  warn,
  once,
  isDef,
  isUndef,
  isTrue,
  isObject,
  hasSymbol,
  isPromise,
  remove
} from 'core/util/index'

import { createEmptyVNode } from 'core/vdom/vnode'
import { currentRenderingInstance } from 'core/instance/render'

// 将传入的内容（一般是 对象）转换为 VueComponent 构造函数
function ensureCtor (comp: any, base) {
  if (
    comp.__esModule ||
    (hasSymbol && comp[Symbol.toStringTag] === 'Module')
  ) {
    // esm 规范输出的 Module 示例，此时 default 属性即是 sfc 输出的 export default 后边输出的对象
    comp = comp.default
  }
  // 通过 base.extend 转换为构造函数
  return isObject(comp)
    ? base.extend(comp)
    : comp
}

export function createAsyncPlaceholder (
  factory: Function,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag: ?string
): VNode {
  const node = createEmptyVNode()
  node.asyncFactory = factory
  node.asyncMeta = { data, context, children, tag }
  return node
}

export function resolveAsyncComponent (
  factory: Function, // 用户传入的 Vue.component 方法调用时传入的第 2 个参数 definition 函数
  baseCtor: Class<Component> // Vue 构造函数
): Class<Component> | void {
  // debugger
  /*出错组件工厂返回出错组件*/
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp
  }

  /*resoved时候返回resolved组件*/
  if (isDef(factory.resolved)) {
    return factory.resolved
  }

  // 当前处理的 vm 示实例
  const owner = currentRenderingInstance
  if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
    // already pending
    factory.owners.push(owner)
  }

  /*返回加载组件*/
  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp
  }

  if (owner && !isDef(factory.owners)) {
    const owners = factory.owners = [owner]
    let sync = true
    let timerLoading = null
    let timerTimeout = null

    ;(owner: any).$on('hook:destroyed', () => remove(owners, owner))

    const forceRender = (renderCompleted: boolean) => {
      for (let i = 0, l = owners.length; i < l; i++) {
        // $forceUpdate 定义在 src\core\instance\lifecycle.js 文件中
        // 调用 vm 实例的 $forceUpdate 方法，强制使得 vm._update(vm._render(), hydrating) 代码能够重新被执行
        // 然后会再次进入当前这个 resolveAsyncComponent 函数内部
        // 再次进入 resolveAsyncComponent 函数之前，如果异步请求的组件成功响应，则下边的 resolve 函数会被执行，然后 factory.resolved 会被赋值为 VueComponent 构造函数
        // 则此次进入时上边的 if (isDef(factory.resolved)) 分支会被命中
        // 之后代码流程返回 src\core\vdom\create-component.js 文件中，Ctor = resolveAsyncComponent(asyncFactory, baseCtor) 代码返回的是 VueComponent 构造函数
        // 之后的逻辑就跟处理普通组件一样的了
        (owners[i]: any).$forceUpdate()
      }

      if (renderCompleted) {
        // 清空 owners 数组，效果等价于 owners.splice(0)
        owners.length = 0
        if (timerLoading !== null) {
          clearTimeout(timerLoading)
          timerLoading = null
        }
        if (timerTimeout !== null) {
          clearTimeout(timerTimeout)
          timerTimeout = null
        }
      }
    }

    // 传入工厂函数的 resolve 回调函数
    const resolve = once((res: Object | Class<Component>) => {
      // cache resolved
      factory.resolved = ensureCtor(res, baseCtor)
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        forceRender(true)
      } else {
        owners.length = 0
      }
    })

    // 传入工厂函数的 reject 回调函数
    const reject = once(reason => {
      process.env.NODE_ENV !== 'production' && warn(
        `Failed to resolve async component: ${String(factory)}` +
        (reason ? `\nReason: ${reason}` : '')
      )
      if (isDef(factory.errorComp)) {
        factory.error = true
        forceRender(true)
      }
    })

    // res 如果是 Promise 对象，则说明是通过 import() 语法导入的异步组件
    // factory 函数的执行是异步的，因此该行代码后续的代码执行优先于 factory 函数结果 res 返回
    const res = factory(resolve, reject)

    if (isObject(res)) {
      if (isPromise(res)) {
        // 进入该分支，说明异步组件注册是使用 import() 函数实现的
        // () => Promise
        if (isUndef(factory.resolved)) {
          // 当 import() 语法触发的网络请求成功或失败响应后，这里的 resolve 和 reject 回调会被执行
          // 然后就会调用 forceRender 函数
          // 然后会再次进入当前这个 resolveAsyncComponent 函数内部
          // 再次进入 resolveAsyncComponent 函数之前，如果异步请求的组件成功响应，则上边的 resolve 函数会被执行，然后 factory.resolved 会被赋值为 VueComponent 构造函数
          // 则此次进入时上边的 if (isDef(factory.resolved)) 分支会被命中
          // 之后代码流程返回 src\core\vdom\create-component.js 文件中，Ctor = resolveAsyncComponent(asyncFactory, baseCtor) 代码返回的是 VueComponent 构造函数
          // 之后的逻辑就跟处理普通组件一样的了
          res.then(resolve, reject)
        }
      } else if (isPromise(res.component)) {
        // 高级异步组件 会进入这个分支！

        res.component.then(resolve, reject)

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor)
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor)
          if (res.delay === 0) {
            // delay 为 0，则对于高级异步组件，该 resolveAsyncComponent 直接返回 factory.loadingComp
            factory.loading = true
          } else {
            timerLoading = setTimeout(() => {
              timerLoading = null
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true
                forceRender(false)
              }
            }, res.delay || 200)
          }
        }

        if (isDef(res.timeout)) {
          timerTimeout = setTimeout(() => {
            timerTimeout = null
            if (isUndef(factory.resolved)) {
              reject(
                process.env.NODE_ENV !== 'production'
                  ? `timeout (${res.timeout}ms)`
                  : null
              )
            }
          }, res.timeout)
        }
      }
    }

    sync = false
    // return in case resolved synchronously
    return factory.loading
      ? factory.loadingComp
      : factory.resolved
  }
}
