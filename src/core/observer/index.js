/* @flow */

import Dep from './dep'
import VNode from '../vdom/vnode'
import { arrayMethods } from './array'
import {
  def,
  warn,
  hasOwn,
  hasProto,
  isObject,
  isPlainObject,
  isPrimitive,
  isUndef,
  isValidArrayIndex,
  isServerRendering
} from '../util/index'

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
export let shouldObserve: boolean = true

export function toggleObserving (value: boolean) {
  shouldObserve = value
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
/*
  每个被观察到对象被附加上观察者实例，一旦被添加，观察者将为目标对象加上getter\setter属性，进行依赖收集以及调度更新。
*/
export class Observer {
  // 观测对象
  value: any;
  // 依赖对象
  dep: Dep;
  // 实例计数器
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    // 将 Observer 实例挂载到观察对象 value 的 __ob__ 属性上
    /* 
      将Observer实例绑定到data的__ob__属性上面去，之前说过observe的时候会先检测是否已经有__ob__对象存放Observer实例了，def方法定义可以参考https://github.com/vuejs/vue/blob/dev/src/core/util/lang.js#L16 
    */
    def(value, '__ob__', this)
    // 数组的响应式处理
    if (Array.isArray(value)) {
      /*
        如果是数组，将修改后可以截获响应的数组方法替换掉该数组的原型中的原生方法，达到监听数组数据变化响应的效果。
        这里如果当前浏览器支持__proto__属性，则直接覆盖当前数组对象原型上的原生数组方法，如果不支持该属性，则直接覆盖数组对象的原型。
      */
      if (hasProto) {
        /*直接覆盖原型的方法来修改目标对象*/
        protoAugment(value, arrayMethods)
      } else {
        /*定义（覆盖）目标对象或数组的某一个方法*/
        copyAugment(value, arrayMethods, arrayKeys)
      }
      // 为数组中每个对象创建一个 observer 实例
      this.observeArray(value)
    } else {
      // 遍历对象的每一个属性，将其转换为 getter/setter
      this.walk(value)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
   /*
      遍历每一个对象并且在它们上面绑定getter与setter。这个方法只有在value的类型是对象的时候才能被调用
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      // 遍历属性，设置响应式数据
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   */
  /*对一个数组的每一个成员进行observe*/
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
 /*直接覆盖原型的方法来修改目标对象或数组*/
function protoAugment (target, src: Object) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
/*定义（覆盖）目标对象或数组的某一个方法*/
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
 /*
 尝试创建一个Observer实例（__ob__），如果成功创建Observer实例则返回新的Observer实例，如果已有Observer实例则返回现有的Observer实例。
 */
export function observe (value: any, asRootData: ?boolean): Observer | void {
  // 判断 value 是否是对象 ， value 是否是 VNode 虚拟 DOM
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  // 1.如果有 __ob__ (observe 对象) 属性，并且 __ob__ 属性是 Observer 的实例
  // 取出 __ob__ 赋值给 ob，并返回 ob
   /*2.这里用__ob__这个属性来判断是否已经有Observer实例，如果没有Observer实例则会新建一个Observer实例并赋值给__ob__这个属性，如果已有Observer实例则直接返回该Observer实例*/
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    /*
      这里的判断是为了确保value是单纯的对象，而不是函数或者是Regexp等情况。
      而且该对象在shouldConvert的时候才会进行Observer。这是一个标识位，避免重复对value进行Observer
    */
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    // 如果 value 是 Vue 实例，不需要进行响应式处理
    !value._isVue
  ) {
    // 创建一个响应式对象，把 value 中的所有属性转变为 getter 和 setter 
    ob = new Observer(value)
  }
  // 对根数据，计数（即 $options.data 传入时，asRootData 为 true）
  if (asRootData && ob) {
    /*如果是根数据则计数，后面Observer中的observe的asRootData就非true*/
    ob.vmCount++
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
/*为对象defineProperty上在变化时通知的属性*/
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  // 创建依赖对象实例，为当前属性 key 收集依赖（收集观察当前属性的 watchers）
  const dep = new Dep()
  // 获取 obj 对象的属性描述符
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  /*如果之前该对象已经预设了getter以及setter函数则将其取出来，新定义的getter/setter中会将其执行，保证不会覆盖之前已经定义的getter/setter。*/
  // 提供预定义的存取器函数
  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  // 1.【深度优先遍历】判断是否需要递归深度观察子对象，(当前属性的值是对象)
  // 并将子对象转化为 getter/setter，然后返回子对象
  // 2.这里 observe 函数第2个参数 asRootData 未传入，即为 undefined
  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      // 获取属性值 value
      // 如果预定义的 getter 存在，则 value 等于调用 getter 返回的值
      // 否则直接赋予属性值
      const value = getter ? getter.call(obj) : val
      // 如果存在当前依赖目标(即 watcher 对象)，建立依赖
      if (Dep.target) {
        // 依赖收集，内部首先会将 dep 对象放到 watcher 对象集合中，然后会将 watcher 对象放到 dep 对象的 subs 数组中
        dep.depend()
        // 如果子观察目标存在，建立子对象的依赖关系
        /*子对象进行依赖收集，其实就是将同一个watcher观察者实例放进了两个depend中，一个是正在本身闭包中的depend，另一个是子元素的depend*/
        if (childOb) {
          childOb.dep.depend()
          // 如果属性值是数组，则特殊处理收集数组对象依赖
          /*是数组则需要对每一个成员都进行依赖收集，如果数组的成员还是数组，则递归。*/
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      // 获取属性值 value
      // 如果预定义的 getter 存在，则 value 等于调用 getter 返回的值
      // 否则直接赋予属性值
      const value = getter ? getter.call(obj) : val
      // 如果新值与旧值相等，或者新旧值为 NaN 的话，return
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // 如果没有 setter，则为只读属性，直接返回
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      // 如果预定义的 setter 存在则调用, 并传入 newVal
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      // 如果 newVal 是对象，进行 observe 处理，并返回 子的 observe 对象
      childOb = !shallow && observe(newVal)
      // 派发更新（发布更改通知）
      /*dep对象通知所有的观察者watcher*/
      dep.notify()
    }
  })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set (target: Array<any> | Object, key: any, val: any): any {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  // 判断 target 是否是数组，key 是否是合法的索引值
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    // splice 在 observer/array.js 中做了响应式处理
    target.splice(key, 1, val)
    /*因为数组不需要进行响应式处理，数组会修改七个Array原型上的方法来进行响应式处理*/
    return val
  }
  // 如果 key 在 target 上已经存在，则直接赋值
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  // 获取 target 中的 observer 对象
  const ob = (target: any).__ob__
  // 如果 target 是 vue 实例或者 $data （$data的 vmCount 属性值为1）直接返回
  /*
    _isVue 一个防止vm实例自身被观察的标志位 ，_isVue为true则代表vm实例，也就是this
    vmCount判断是否为根节点，存在则代表是data的根节点，Vue 不允许在已经创建的实例上动态添加新的根级响应式属性(root-level reactive property)
  */
  if (target._isVue || (ob && ob.vmCount)) {
    /*  
      Vue 不允许在已经创建的实例上动态添加新的根级响应式属性(root-level reactive property)。
      https://cn.vuejs.org/v2/guide/reactivity.html#变化检测问题
    */
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  // 如果 ob 不存在，target 不是响应式对象，则对应的key没必要响应式处理
  if (!ob) {
    target[key] = val
    return val
  }
  // 把 key 设置为响应式属性
  /*为对象defineProperty上在变化时通知的属性*/
  defineReactive(ob.value, key, val)
  // 发送通知
  ob.dep.notify()
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del (target: Array<any> | Object, key: any) {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    /*通过对象上的观察者进行依赖收集*/
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      /*当数组成员还是数组的时候地柜执行该方法继续深层依赖收集，直到是对象为止。*/
      dependArray(e)
    }
  }
}
