/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // 函数中的 this 指向 Vue 的构造函数
    // 插件如果已经注册，则不会重复进行插件的安装操作
    // 体现在 _installedPlugins 数组中已经存在了安装的插件元素
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    } 

    // additional parameters
    // toArray 实际位置：src/shared/utils.js
    // 把数组中的第一个元素(plugin)去除，保留plugin相关的配置内容
    const args = toArray(arguments, 1)
    // 把this(Vue)插入第一个元素的位置
    args.unshift(this)
    // 如果传入的plugin是对象，则要求必须该对象上必须有一个 install 方法，因为这里要执行
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }

    // 插件安装后，需要缓存到 installedPlugins 数组中
    installedPlugins.push(plugin)
    return this
  }
}
