#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

const { FileDepAnalyse, getBranchDiffDep } = require('./utils/depAnalyse')
const simpleGit = require('simple-git')

// function start() {
//   Promise.all([
//     getFileDep(),
//     git.diffSummary([config.oldBranch, config.newBranch]),
//   ])
//     .then((data) => {
//       const [fileDepData, branchDiffData] = data
//       const branchDiffDep = getBranchDiffDep(fileDepData, branchDiffData)

//       // 将文件些人到html模板
//       const template = fs.readFileSync(
//         path.join(__dirname, './utils/template.html'),
//         'utf-8'
//       )

//       // fs.writeFileSync(path.join(config.base, 'branchDiffDep.json'), JSON.stringify(branchDiffDep))
//       // fs.writeFileSync(path.join(config.base, 'branchDiffData.json'), JSON.stringify(branchDiffData))
//       // fs.writeFileSync(path.join(config.base, 'fileDepData.json'), JSON.stringify(fileDepData))

//       const html = ejs.render(template, { branchDiffDep })
//       fs.writeFileSync(path.join(config.base, 'depAnalyse.html'), html)
//       console.log('文件差异化扫描完成,详情见根目录depAnalyse.html文件')
//     })
//     .catch((e) => {
//       console.log(e)
//     })
// }

// start()

class cover {
  constructor(options) {
    this.setOption(options)
    // 临时clone目录ming
    this.tmpDir = undefined
    // 临时clone路径
    this.cloneRepoDirPath = undefined
    // 该实例的git操作对象
    this.git = undefined
    this.dependencies = []
  }
  setOption(options) {
    this.options = {
      clonePath: options.clonePath,
      entry: options.entry,
      oldBranch: options.oldBranch,
      newBranch: options.newBranch,
      alias: options.alias,
      repository: options.repository,
    }
  }
  getEffectScopeData() {
    return new Promise(async (resolve, reject) => {
      // 创建clone目录
      this.createTmpDir()
      // 下载仓库clone
      await this.cloneRepo()
      // 检出最新分支
      await this.checkoutNewBranch()
      // 获取package.json中的dependencies
      this.getDependencies()
      // 从入口文件获取项目的依赖树
      const fileDepAnalyse = new FileDepAnalyse({
        cloneRepoDirPath: this.cloneRepoDirPath,
        entry: this.options.entry,
        dependencies: this.dependencies,
        alias: this.options.alias,
        cover: this,
      })
      const { fileDepData, error } = await fileDepAnalyse.getFileDep()
      // 如果有错误则抛出异常
      const branchDiffData = await this.getDiffSummary()
      const branchDiffDep = getBranchDiffDep(
        fileDepData,
        branchDiffData,
        this.cloneRepoDirPath
      )
      // // html模板
      // const template = fs.readFileSync(
      //   path.join(__dirname, './utils/template.html'),
      //   'utf-8'
      // )
      // const html = ejs.render(template, { branchDiffDep })
      // fs.writeFileSync(path.join(this.options.clonePath, 'depAnalyse.html'), html)
      // console.log('文件差异化扫描完成,详情见根目录depAnalyse.html文件')
      // 执行完毕将临时目录删除
      this.delTmpDir()
      resolve(branchDiffDep)
    }).catch((e) => {
      this.delTmpDir()
      throw e
    })
  }
  cloneRepo() {
    return this.git
      .silent(true)
      .clone(this.options.repository, this.cloneRepoDirPath)
  }
  createTmpDir() {
    // 使用随机字符串生成一个tmp目录用来存放clone下来的仓库
    this.tmpDir = parseInt(Math.random() * 1000000000).toString()
    this.cloneRepoDirPath = path.join(this.options.clonePath, this.tmpDir)
    fs.mkdirSync(this.cloneRepoDirPath)
    this.git = simpleGit(this.cloneRepoDirPath)
  }
  checkoutNewBranch() {
    return this.git.checkoutBranch(
      this.options.newBranch,
      this.getOriginBranch(this.options.newBranch)
    )
  }
  getDiffSummary() {
    return this.git.diffSummary([
      this.getOriginBranch(this.options.oldBranch),
      this.getOriginBranch(this.options.newBranch),
    ])
  }
  getOriginBranch(branchName) {
    return `origin/${branchName}`
  }
  delTmpDir() {
    const spawnSync = require('child_process').spawnSync
    const child = spawnSync('rm', ['-r', '-f', this.cloneRepoDirPath])
    return child.error
  }
  getDependencies() {
    const pkgPath = path.join(this.cloneRepoDirPath, 'package.json')
    const pkg = require(pkgPath)
    const dependencies = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    }
    this.dependencies = Object.keys(dependencies).concat('node_modules')
  }
}

process.on('message', function (params) {
  if (params.status === 'start') {
    const coverExamle = new cover(params.options)
    coverExamle
      .getEffectScopeData()
      .then((data) => {
        // console.log('获取最终数据:', data)
        process.send({
          status: 'success',
          data,
        })
      })
      .catch()
  }
})
