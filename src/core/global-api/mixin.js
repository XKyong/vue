/* @flow */

import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    // 1.业务代码中使用 “import Vue from 'vue'”的时候，Vue.options 上即会初始化一些内容了
    // 具体初始化哪些内容，详细见：src\core\global-api\index.js
    // 2.将 mixin 混入到 this.options 中，即 Vue.options 中
    // mergeOptions 实际位置在 core/util/options.js 里边
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
