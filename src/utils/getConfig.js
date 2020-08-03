const path = require('path')
const fs = require('fs')

const exts = ['.js', '.vue', '.jsx', '.json', '.svg', '.png', '.jpg']
// 补充package中依赖库的数据，依赖数据解析时，需要跳过依赖库的解析

function loadConfig () {
  const base = process.cwd()
  const coverPath = path.join(process.cwd(), '.cover.js')
  const pkgPath = path.join(base, 'package.json')
  const pkg = require(pkgPath)
  const dependencies = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  }
  const config = require(coverPath)
  config.base = path.dirname(coverPath)
  config.exts = config.exts ? config.exts : exts
  config.dependencies = Object.keys(dependencies)
  // console.log(config);
  return config
}

const getConfig = (function () {
  const config = loadConfig()
  return function () {
    return config
  }
})()

module.exports = getConfig
