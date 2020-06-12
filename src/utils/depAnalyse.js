const path = require('path')
const babylon = require('@babel/parser')
const traverse = require('@babel/traverse').default
const depState = require('./depState')
const {
  importPathTransform,
  getAbsolutePath,
  isJsFilePath,
} = require('./pathAnalyse')
const config = require('./getConfig')()
const { getFileDesc } = require('./commentBlock')
const matchLoad = require('./load')

function parse(codeStr) {
  return babylon.parse(codeStr, {
    sourceType: 'module',
    plugins: ['jsx', 'classProperties'],
  })
}

function getCodeAst(filePath) {
  // 判断文件后缀
  return parse(matchLoad(filePath))
}

function mouduleAnalyse(curFilePath, depFilePath) {
  try {
    const curPath = path.dirname(curFilePath)
    const indexSlash = depFilePath.indexOf('/')
    const subDepFilePath =
      indexSlash === -1 ? depFilePath : depFilePath.substring(0, indexSlash)
    if (config.dependencies.includes(subDepFilePath)) {
      // 公共依赖库不需要进行解析
      return
    }
    importPathTransform(curPath, depFilePath)
      .then((filePath) => {
        let fileDesc = {}
        if (!depState.hasFileState(filePath)) {
          // 没被解析过的文件，才需要进行解析
          if (isJsFilePath(filePath)) {
            // 如果是js、vue、jsx，继续进行依赖分析
            const codeAst = getCodeAst(filePath)
            fileDesc = getFileDesc(codeAst)
            getDep(codeAst, filePath)
          }
        }
        // TODO: 可以对其他类型的文件进行解析，获取一些描述
        depState.addDep(filePath, fileDesc, curFilePath)
      })
      .catch((e) => {
        console.log(`
          当前文件路径：${curPath}
          依赖文件路径：${depFilePath}
          截取后的路径：${subDepFilePath}
          ${e}
        `)
      })
  } catch (error) {
    console.log(error)
  }
}

function getDep(ast, curFilePath) {
  // TODO: 解决循环引用问题，a引用b，b又引用a的情况
  traverse(ast, {
    ImportDeclaration({ node }) {
      // TODO: 使用async await
      // 需要跳过公共模块的依赖
      // TODO: react/www,对这种依赖的处理
      const depFilePath = node.source.value
      mouduleAnalyse(curFilePath, depFilePath)
    },
    CallExpression({ node }) {
      // 异步模块解析：import('@views/system/index.jsx')
      if (node.callee.type === 'Import') {
        const depFilePath = node.arguments[0].value
        mouduleAnalyse(curFilePath, depFilePath)
      }
    },
  })
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
