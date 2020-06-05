class depState {
  constructor() {
    this.state = {
      // fileName: {
      //     desc: {},
      //     dep: [],
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
      desc: fileDesc,
      beDeped: [],
    }
  }
  addFileBeDeped(filePath, beDepedFilePath) {
    if (this.hasFileState(filePath)) {
      this.state[filePath].beDeped.push(beDepedFilePath)
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
