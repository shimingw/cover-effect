const path = require('path')
const config = require('./getConfig')()

class depState {
  constructor() {
    this.state = {
      // fileName: {
      //     fileDesc: {},
      //     beDeped: [],
      //   },
    }
  }
  getState() {
    return this.state
  }
  /**
   *
   * @param {*} filePath 文件路径
   * @param {*} fileDesc 文件描述
   * @param {*} beDepedFilePath 依赖改文件的路径
   */
  addDep(filePath, fileDesc, beDepedFilePath) {
    // 将filePath、beDepedFilePath转换成相对于base的路径
    const { base } = config
    filePath = path.relative(base, filePath)
    beDepedFilePath = beDepedFilePath
      ? path.relative(base, beDepedFilePath)
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
      this.state[filePath].beDeped.push(this.state[beDepedFilePath])
    }
  }
  /**
   * 判断该文件路径是被保存
   * @param {*} filePath
   * @returns Boolean
   */
  hasFileState(filePath) {
    return Boolean(this.state[filePath])
  }
}

module.exports = new depState()
