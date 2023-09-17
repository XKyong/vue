<template>
  <div class="MyTitle">
    <h1>This Is My Title Component</h1>
  </div>
</template>

<script>
export default {
  name: "MyTitle",
  beforeCreate () {
    console.log('MyTitle beforeCreate')
  },
  created () {
    console.log('MyTitle created')
  },
  beforeUpdate () {
    console.log('MyTitle beforeUpdate')
  },
  updated () {
    console.log('MyTitle updated')
  },
  beforeMount () {
    console.log('MyTitle beforeMount')
  },
  mounted () {
    console.log('MyTitle mounted')
  },
  beforeDestroy () {
    console.log('MyTitle beforeDestroy')
  },
  destroyed () {
    console.log('MyTitle destroyed')
  }
};
</script>
