/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 初始化 Vue.config 对象
  Object.defineProperty(Vue, 'config', configDef)
  // 然后在 platforms/web/runtime/index.js 文件中往该 config 对象上挂载了些对象

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 这些工具方法不视为全局API的部分，除非你已经意识到某种风险，否则不要去依赖他们（即不在我们自己的Web项目中使用）
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  // 分析完“响应式”再来细究源码细节！---------------
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }

  // ----------------------------------------------

  /*初始化 Vue.options 对象，并给其扩展 */
  /* 包括components/filters/directives */
  // 设置原型为 null，以提高性能
  Vue.options = Object.create(null)
  // ASSET_TYPES：['component', 'directive', 'filter']
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  // 设置 keep-alive 组件
  // 这里的 extend 函数的具体位置为：shared/util 
  // extend作用就是将参数2的对象浅拷贝给参数1的对象
  extend(Vue.options.components, builtInComponents)

  // 00:76:30后续的内容待看！！！
  // 注册 Vue.use，用来注册插件
  initUse(Vue)
  // 注册 Vue.mixin，用来实现混入
  initMixin(Vue)
  // 注册 Vue.extend，基于传入的options返回一个组件的构造函数
  initExtend(Vue)
  // 注册 Vue.directive()/Vue.component()/Vue.filter()
  initAssetRegisters(Vue)
}
