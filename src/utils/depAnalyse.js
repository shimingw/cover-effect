const fs = require('fs')
const path = require('path')
const babylon = require('@babel/parser')
const traverse = require('@babel/traverse').default
const depState = require('./depState')

const config = require('./getConfig')()
const { getFileDesc } = require('./commentBlock')

function getCodeStr(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

function getAbsolutePath(curPath, relativePath) {
  if (path.isAbsolute(relativePath)) {
    return path.normalize(relativePath)
  } else {
    return path.join(curPath, relativePath)
  }
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
        // 这里的value可能是目录也可能是alias变量
        const filePath = importPathTransform(curPath, node.source.value)
        const codeAst = getCodeAst(filePath)
        const fileDesc = getFileDesc(codeAst)
        depState.addDep(filePath, fileDesc, curFilePath)
        getDep(codeAst, filePath)
      } catch (error) {
        // console.log(filePath)
        throw error
      }
    },
  })
}

function importPathTransform(curPath, relativePath) {
  // TODO:这里要进行文件后缀名匹配
  // 解析命名别名
  relativePath = replaceAlias(relativePath)
  // 将相对路径转化成绝对路径
  let absolutePath = getAbsolutePath(curPath, relativePath)
  if (fs.statSync(absolutePath).isFile()) {
    return absolutePath
  } else {
    return path.join(absolutePath, 'index.js')
  }
}

function replaceAlias(relativePath) {
  const { alias } = config
  for (const [key, value] of Object.entries(alias)) {
    if (relativePath.includes(key)) {
      relativePath = relativePath.replace(key, value)
      break
    }
  }
  return relativePath
}

function getFileDep() {
  return new Promise((resolve, reject) => {
    try {
      const { base, entry } = config
      const entryFilePath = getAbsolutePath(base, entry)
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

function getBranchDiffDep(fileDepData, branchDiffData) {
  const branchDiffFiles = branchDiffData.files
  const BranchDiffDep = []
  for (const branchDiffFile of branchDiffFiles) {
    const branchDiffFilePath = path.relative(config.base, branchDiffFile.file)
    if (Reflect.has(fileDepData, branchDiffFilePath)) {
      BranchDiffDep.push({
        ...branchDiffFile,
        ...fileDepData[branchDiffFilePath],
        file: branchDiffFilePath,
      })
    }
  }
  return BranchDiffDep
}

module.exports = { getFileDep, getBranchDiffDep }
