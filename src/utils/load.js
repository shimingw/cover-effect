const path = require('path')
const fs = require('fs')
const compiler = require('vue-template-compiler')

function vueLoad (filePath) {
  const codeStr = getCodeStr(filePath)
  return compiler.parseComponent(codeStr).script.content
}

function getCodeStr (filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

function matchLoad (filePath) {
  const ext = path.extname(filePath)
  if (ext === '.vue') {
    return vueLoad(filePath)
  } else {
    //   js,jsx
    return getCodeStr(filePath)
  }
}

module.exports = matchLoad
