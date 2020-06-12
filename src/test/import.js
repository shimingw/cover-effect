const babylon = require('@babel/parser')
const traverse = require('@babel/traverse').default
const compiler = require('vue-template-compiler')
// https://segmentfault.com/a/1190000018753707#item-3-6
const jsxCode = `
import('@views/system/index.jsx')
const system = loadable(() => import('@views/system/index.jsx'))
const sysDetail = loadable(() => import('@views/system/detail.jsx'))
const qweqwe = ()=>import('@views/system/index.jsx')
`

const jsxAst = babylon.parse(jsxCode, {
  sourceType: 'module',
  plugins:['jsx']
})


// const vueAst = babylon.parse(compiler.parseComponent(vueCode).script.content, {
//   sourceType: 'module',
//   plugins:['jsx']
// })
// console.log(jsxAst);


traverse(jsxAst, {
    CallExpression({ node }) {
        if(node.callee.type === 'Import'){
            console.log(node.arguments[0].value);
        }
    }
  })