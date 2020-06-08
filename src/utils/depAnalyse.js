const fs = require('fs')
const path = require('path')
const babylon = require('@babel/parser')
const traverse = require('@babel/traverse').default
const depState = require('./depState')

const getConfig = require('./getConfig')
const { getFileDesc } = require('./commentBlock')

function getCodeStr(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

function parse(codeStr) {
  return babylon.parse(codeStr, {
    sourceType: 'module',
  })
}

function getCodeAst(filePath) {
  return parse(getCodeStr(filePath))
}

function getDep(ast, curFilePath) {
  const curPath = path.dirname(curFilePath)
  traverse(ast, {
    ImportDeclaration({ node }) {
      try {
        const relativePath = node.source.value
        const filePath = path.join(curPath, relativePath)
        const codeAst = getCodeAst(filePath)
        const fileDesc = getFileDesc(codeAst)
        depState.addDep(filePath, fileDesc, curFilePath)
        getDep(codeAst, filePath)
      } catch (error) {
        console.log(filePath);
        throw(error)
      }
    },
  })
}

function getFileDep() {
  return new Promise((resolve, reject) => {
    try {
      const { base, entry } = getConfig()
      const entryFilePath = path.join(base, entry)
      const ast = getCodeAst(entryFilePath)
      const fileDesc = getFileDesc(ast)
      depState.addDep(entryFilePath, fileDesc)
      getDep(ast, entryFilePath)
      resolve(depState.getState())
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = getFileDep
