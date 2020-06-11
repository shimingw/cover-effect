const babylon = require('@babel/parser')
const compiler = require('vue-template-compiler')
// https://segmentfault.com/a/1190000018753707#item-3-6
const code = `
<template>
 <div>

 </div>
</template>

<script>
export default {
 data() {
 return {

 }
 },
}
</script>

<style lang="postcss" scoped>
</style>
`


const ast = babylon.parse(compiler.parseComponent(code).script.content, {
    sourceType: 'module',
  })


