const fs = require('fs')
const path = require('path')

const config = require('./utils/getConfig')()
const getFileDep = require('./utils/depAnalyse')
// const getGitBranchDiff = require('./utils/gitDiff')
const simpleGit = require('simple-git')
const git = simpleGit(process.cwd())

function writeDepState(depState) {
  const { base } = config
  fs.writeFileSync(path.join(base, 'depState.json'), JSON.stringify(depState))
}

console.log(path.join(process.cwd(), 'example/app/.cover.js'))

getFileDep()
  .then((depState) => {
    // 获取到文件依赖信息
    // console.log(config);
    git.diffSummary([config.oldBranch, config.newBranch]).then((data) => {
      console.log(data)
    })

    // writeDepState(depState)
  })
  .catch((e) => {
    console.log(e)
  })
