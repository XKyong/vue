/* @flow */

import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    // 将 mixin 混入到 this.options 中，即 Vue.options 中
    // mergeOptions 实际位置在 core/util/options.js 里边
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
