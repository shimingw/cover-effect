#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

// const config = require('./utils/getConfig')()
// const { getFileDep, getBranchDiffDep } = require('./utils/depAnalyse')
const simpleGit = require('simple-git')
// const git = simpleGit(process.cwd())

function start() {
  Promise.all([
    getFileDep(),
    git.diffSummary([config.oldBranch, config.newBranch]),
  ])
    .then((data) => {
      const [fileDepData, branchDiffData] = data
      const branchDiffDep = getBranchDiffDep(fileDepData, branchDiffData)

      // 将文件些人到html模板
      const template = fs.readFileSync(
        path.join(__dirname, './utils/template.html'),
        'utf-8'
      )

      // fs.writeFileSync(path.join(config.base, 'branchDiffDep.json'), JSON.stringify(branchDiffDep))
      // fs.writeFileSync(path.join(config.base, 'branchDiffData.json'), JSON.stringify(branchDiffData))
      // fs.writeFileSync(path.join(config.base, 'fileDepData.json'), JSON.stringify(fileDepData))

      const html = ejs.render(template, { branchDiffDep })
      fs.writeFileSync(path.join(config.base, 'depAnalyse.html'), html)
      console.log('文件差异化扫描完成,详情见根目录depAnalyse.html文件')
    })
    .catch((e) => {
      console.log(e)
    })
}

// start()

module.exports = class cover {
  constructor(options) {
    this.setOption(options)
    // 临时clone目录ming
    this.tmpDir = ''
    // 临时clone路径
    this.cloneRepoDirPath = ''
  }
  setOption(options) {
    this.options = {
      clonePath: options.clonePath,
      entry: options.entry,
      oldBranch: options.oldBranch,
      newBranch: options.newBranch,
      alias: options.alias,
    }
  }
  getEffectScopeData() {
    return new Promise(async (resolve, reject) => {
      // 创建clone目录
      const createTmpDirErr = this.createTmpDir()
      if (createTmpDirErr) {
        reject(`创建clone目录失败: ${createTmpDirErr}`)
      }
      const cloneRepoErr = await this.cloneRepo()
      if (cloneRepoErr) {
        // 下载仓库clone失败
        reject(`下载仓库失败: ${cloneRepoErr}`)
      }

    })
  }
  async cloneRepo() {
    try {
      const res = await simpleGit(this.cloneRepoDirPath)
        .silent(true)
        .clone(
          'git@git.cnsuning.com:damfe/data_check.git',
          this.cloneRepoDirPath
        )
      return res
    } catch (error) {
      return error
    }
  }
  createTmpDir() {
    try {
      // 使用随机字符串生成一个tmp目录用来存放clone下来的仓库
      this.tmpDir = parseInt(Math.random() * 1000000000).toString()
      this.cloneRepoDirPath = path.join(this.options.clonePath, this.tmpDir)
      return fs.mkdirSync(this.cloneRepoDirPath)
    } catch (error) {
      return error
    }
  }

  getDiffSummary() {
    return simpleGit(this.cloneRepoDirPath)
      .diffSummary([
        this.getOriginBranch(this.options.oldBranch),
        this.getOriginBranch(this.options.newBranch),
      ])
      .then((data) => {
        console.log(data)
      })
  }

  getOriginBranch(branchName) {
    return `origin/${branchName}`
  }
}
