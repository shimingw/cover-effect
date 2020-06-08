const fs = require('fs')
const path = require('path')

const getConfig = require('./utils/getConfig')
const getFileDep = require('./utils/depAnalyse')

function writeDepState(depState) {
  const { base } = getConfig()
  fs.writeFileSync(path.join(base,'depState.json'),JSON.stringify(depState))
}

getFileDep()
  .then((depState) => {
    // 获取到文件依赖信息
    console.log(depState)
    // writeDepState(depState)
  })
  .catch((e) => {
    console.log(e)
  })
