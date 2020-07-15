const path = require('path')
const babylon = require('@babel/parser')
const traverse = require('@babel/traverse').default
const DepState = require('./depState')
const {
  importPathTransform,
  getAbsolutePath,
  isJsFilePath,
  getPathHead,
} = require('./pathAnalyse')
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

function getBranchDiffDep(fileDepData, branchDiffData, cloneRepoDirPath) {
  const branchDiffFiles = branchDiffData.files
  const BranchDiffDep = []
  for (const branchDiffFile of branchDiffFiles) {
    const branchDiffFilePath = path.relative(
      cloneRepoDirPath,
      branchDiffFile.file
    )
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

class FileDepAnalyse {
  constructor(options) {
    this.cloneRepoDirPath = options.cloneRepoDirPath
    this.entry = options.entry
    this.dependencies = options.dependencies
    this.alias = this.transformAlias(options.alias)
    this.depState = new DepState(this.cloneRepoDirPath)
  }
  getFileDep() {
    return new Promise((resolve, reject) => {
      try {
        const entryFilePath = getAbsolutePath(this.cloneRepoDirPath, this.entry)
        const ast = getCodeAst(entryFilePath)
        const fileDesc = getFileDesc(ast, entryFilePath)
        this.depState.addDep(entryFilePath, fileDesc)
        this.getDep(ast, entryFilePath)
        setTimeout(() => {
          // 延时5s等待所有依赖文件扫描完毕再resolve
          resolve(this.depState.getState())
        }, 5000)
        console.log('正在扫描文件,请稍等...')
      } catch (error) {
        reject(error)
      }
    })
  }
  getDep(ast, curFilePath) {
    const _this = this
    // TODO: 解决循环引用问题，a引用b，b又引用a的情况
    traverse(ast, {
      ImportDeclaration({ node }) {
        // TODO: 使用async await
        // 需要跳过公共模块的依赖
        // TODO: react/www,对这种依赖的处理
        const depFilePath = node.source.value
        _this.mouduleAnalyse(curFilePath, depFilePath)
      },
      CallExpression({ node }) {
        // 异步模块解析：import('@views/system/index.jsx')
        if (node.callee.type === 'Import') {
          const depFilePath = node.arguments[0].value
          _this.mouduleAnalyse(curFilePath, depFilePath)
        }
      },
    })
  }

  mouduleAnalyse(curFilePath, depFilePath) {
    try {
      const curPath = path.dirname(curFilePath)
      const pathHead = getPathHead(depFilePath)
      if (this.dependencies.includes(pathHead)) {
        // 公共依赖库不需要进行解析
        return
      }

      importPathTransform(curPath, depFilePath, this.alias)
        .then((filePath) => {
          let fileDesc = {}
          if (!this.depState.hasFileState(filePath)) {
            // 没被解析过的文件，才需要进行解析
            if (isJsFilePath(filePath)) {
              // 如果是js、vue、jsx，继续进行依赖分析
              const codeAst = getCodeAst(filePath)
              fileDesc = getFileDesc(codeAst, filePath)
              this.getDep(codeAst, filePath)
            }
          }
          // TODO: 可以对其他类型的文件进行解析，获取一些描述
          this.depState.addDep(filePath, fileDesc, curFilePath, depFilePath)
        })
        .catch((e) => {
          console.log(`
            当前文件路径：${curFilePath}
            依赖文件路径：${depFilePath}
            路径头：${pathHead}
          `)
          throw e
        })
    } catch (error) {
      console.log(error)
    }
  }
  transformAlias(alias) {
    const aliasTmp = {}
    for (const [key, value] of Object.entries(alias)) {
      aliasTmp[key] = path.join(this.cloneRepoDirPath, value)
    }
    return aliasTmp
  }
}

module.exports = { FileDepAnalyse, getBranchDiffDep }
