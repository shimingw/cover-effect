#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const { errorLog } = require('./utils/log')

const { FileDepAnalyse, getBranchDiffDep } = require('./utils/depAnalyse')
const simpleGit = require('simple-git')

class Cover {
  constructor (options) {
    this.setOption(options)
    // 仓库目录
    this.repoDirPath = options.base
    // 该实例的git操作对象
    this.git = simpleGit(this.repoDirPath)
  }

  setOption (options) {
    this.options = {
      entry: options.entry,
      oldBranch: options.oldBranch,
      newBranch: options.newBranch,
      alias: options.alias,
      dependencies: options.dependencies
    }
  }

  async getEffectScopeData () {
    const checkCurrentBranchRes = await this.checkCurrentBranch()
    if (!checkCurrentBranchRes) {
      errorLog(`请将当前分支切换到${this.options.newBranch}`)
    }
    const fileDepAnalyse = new FileDepAnalyse({
      repoDirPath: this.repoDirPath,
      entry: this.options.entry,
      dependencies: this.options.dependencies,
      alias: this.options.alias,
      cover: this
    })

    const [fileDepData, branchDiffData] = await Promise.all([
      fileDepAnalyse.getFileDep(),
      this.getDiffSummary()
    ])
    const branchDiffDep = getBranchDiffDep(
      fileDepData,
      branchDiffData,
      this.repoDirPath
    )
    // html模板
    const template = fs.readFileSync(
      path.join(__dirname, './utils/template.html'),
      'utf-8'
    )
    const html = ejs.render(template, { branchDiffDep })
    fs.writeFileSync(path.join(this.repoDirPath, 'depAnalyse.html'), html)
    console.log('文件差异化扫描完成,详情见根目录depAnalyse.html文件')
  }

  getDiffSummary () {
    return this.git.diffSummary([
      this.getOriginBranch(this.options.oldBranch),
      this.getOriginBranch(this.options.newBranch)
    ])
  }

  getOriginBranch (branchName) {
    return `origin/${branchName}`
  }

  // 检查当前分支是否为newBranch
  async checkCurrentBranch () {
    try {
      const { branches } = await this.git.branchLocal()
      return branches[this.options.newBranch].current
    } catch (error) {
      return false
    }
  }
}

module.exports = Cover
