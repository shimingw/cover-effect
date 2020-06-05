const fs = require('fs')
const path = require('path')
const babylon = require('@babel/parser')
const traverse = require('@babel/traverse').default

const getConfig = require('./utils/getConfig')
const { getCommentBlock, compileCommentBlock } = require('./commentBlock')

function getDep(ast) {
  traverse(ast, {
    ImportDeclaration({ node }) {
      console.log(node.source.value)
    },
  })
}

function parse(codeStr) {
  return babylon.parse(codeStr, {
    sourceType: 'module',
  })
}

function getFileDesc(ast) {
  const fileDescStr = getCommentBlock(ast.comments)
  return compileCommentBlock(fileDescStr)
}

function run(root, entryFilePath) {
  const entry = path.join(root, entryFilePath)
  const codeStr = fs.readFileSync(entry, 'utf-8')
  const ast = parse(codeStr)
  // const fileDesc = getFileDesc(ast)
  getDep(ast)
}

module.exports = run
