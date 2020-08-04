const babylon = require('@babel/parser')
const compiler = require('vue-template-compiler')
// https://segmentfault.com/a/1190000018753707#item-3-6
const vueCode = `
<template>
  <div></div>
</template>

<script>
import '@b/b'

export default {
  data() {
    return {}
  },
  async mounted() {
    await this.qwe()
  },
  methods: {
    qwe() {},
  },
}
</script>

<style lang="postcss" scoped></style>
`

const jsxCode = `
import React, { Component } from 'react';

(async function (params) {
    
})()

class parser extends Component {
  render() {
    return (
      <div>
        
      </div>
    );
  }
}

export default parser;`

const jsxAst = babylon.parse(jsxCode, {
  sourceType: 'module',
  plugins: ['jsx']
})

const vueAst = babylon.parse(compiler.parseComponent(vueCode).script.content, {
  sourceType: 'module',
  plugins: ['jsx']
})
// console.log(jsxAst);
console.log(vueAst)
