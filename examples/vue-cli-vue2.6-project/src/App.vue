<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <button @click="isShow = !isShow">切换HelloWorld显隐</button>
    <HelloWorld v-if="isShow" msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";

export default {
  name: "App",
  components: {
    HelloWorld,
  },
  data () {
    return {
      // 用以验证 beforeDestroy 和 destroyed 的执行顺序
      // beforeDestroy 和 destroyed 钩子函数的执行时机在组件销毁的阶段
      isShow: true
    }
  },
  beforeCreate () {
    console.log('App beforeCreate')
  },
  created () {
    console.log('App created')
  },
  beforeUpdate () {
    console.log('App beforeUpdate')
  },
  updated () {
    console.log('App updated')
  },
  beforeMount () {
    console.log('App beforeMount')
  },
  mounted () {
    console.log('App mounted')
  },
  beforeDestroy () {
    console.log('App beforeDestroy')
  },
  destroyed () {
    console.log('App destroyed')
  }
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
