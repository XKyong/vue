/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// 保留 Vue 实例的 $mount
const mount = Vue.prototype.$mount
// 想要知道这里的 $mount 具体在哪里被调用，可以借助于 Chrome 开发者工具的 Source 面板中的 call stack！
Vue.prototype.$mount = function (
  el?: string | Element,
  // 非 ssr 情况下为 false， ssr 时候为 true 
  hydrating?: boolean
): Component {
  // 获取 el 对象
  el = el && query(el)

  /* istanbul ignore if */
  // 1. el 不能是 body 或者 html 
  // 为啥不能是 body 和 html？
  // 因为这个 el 最终是会被从DOM树中移除的，涉及代码在 src/core/vdom/patch.js 文件中 removeVnodes([oldVnode], 0, 0) 这行代码
  // 取而代之的会是用户传入或编译生成的 render 函数中 createElement 生成的 VNode 实例树转换成的真实的 DOM 树
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // 2. 如果没有传 render，则会进入以下的逻辑分支中，主要功能是将 template/el 转化为 render 函数 
  // 当 render 和 template 字段同时存在时，这里表明 render 函数会优先被处理
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        // 如果 template 是 id 选择器，则通过该 id 选择器调用 document.querySelector 拿到 dom 节点
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        // 如果传入的就是一个 html 元素了，则直接拿 template.innerHTML 作为模板
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // 如果没有 template，获取 el 的 outerHTMl 作为模板
      // 获取的内容形如："<div id=\"app\">{{message}}</div>"
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }
      
      // 把 template 转换为 render 函数
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }

  // 3. 如果传入了 render 方法，则执行 render，不执行上述 template 的转换操作
  // 传入的是组件的话，比如 examples/vue-cli-vue2.6-project 例子传入的 App 组件，
  // 则直接执行下边的代码，因为传入该 Vue.prototype.$mount 方法的 el 参数是 undefined 的！
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  // 对于 <div id="app">hello vue</div> 这样的el：
  // el.outerHTML 结果为：'<div id="app">hello vue</div>'
  // el.innerHTML 结果为：'hello vue'
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
