const path = require('path')

module.exports = class depState {
  constructor(base) {
    this.state = {
      // fileName: {
      //     fileDesc: {},
      //     beDeped: [],
      //   },
    }
    this.recordFilePath = []
    this.error = []
    this.base = base
  }
  /**
   *
   * @param {*} filePath 文件路径
   * @param {*} fileDesc 文件描述
   * @param {*} beDepedFilePath 被依赖文件的路径
   */
  addDep(filePath, fileDesc, beDepedFilePath) {
    // 将filePath、beDepedFilePath转换成相对于base的路径
    // 将绝对路径转换成相对路径
    filePath = path.relative(this.base, filePath)
    beDepedFilePath = beDepedFilePath
      ? path.relative(this.base, beDepedFilePath)
      : undefined
    if (!this.hasFileState(filePath)) {
      this.initFileDep(filePath, fileDesc)
    }
    if (beDepedFilePath) {
      this.addFileBeDeped(filePath, beDepedFilePath)
    }
  }
  /**
   * 初始化模块依赖状态
   * @param {*} filePath    文件路径
   * @param {*} fileDesc    文件描述
   */
  initFileDep(filePath, fileDesc) {
    this.state[filePath] = {
      fileDesc: {
        file: filePath,
        ...fileDesc,
      },
      beDeped: [],
    }
  }
  addFileBeDeped(filePath, beDepedFilePath) {
    if (this.hasFileState(filePath)) {
      this.state[filePath].beDeped.push({
        ...this.state[beDepedFilePath],
        beDeped:undefined
      })
    }
  }
  /**
   * 判断该文件路径是被保存
   * @param {*} filePath
   * @returns Boolean
   */
  hasFileState(filePath) {
    // this.state中存的是相对路径需要转化一下
    filePath = path.isAbsolute(filePath)
      ? path.relative(this.base, filePath)
      : filePath
    return Boolean(this.state[filePath])
  }
  addError(e) {
    this.error.push(e)
  }
}
