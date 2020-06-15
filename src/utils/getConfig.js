const path = require('path')
const fs = require('fs')

const exts = ['.js', '.vue', '.jsx', '.json', '.svg', '.png', '.jpg']
// 补充package中依赖库的数据，依赖数据解析时，需要跳过依赖库的解析

function loadConfig() {
  const base = process.cwd()
  const coverPath = path.join(process.cwd(), '.cover.js')
  const pkgPath = path.join(base, 'package.json')
  const pkg = require(pkgPath)
  const dependencies = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  }
  const config = require(coverPath)
  config.base = path.dirname(coverPath)
  config.exts = config.exts ? config.exts : exts
  config.dependencies = config.dependencies
    ? config.dependencies
    : Object.keys(dependencies)

  return config
}

const getConfig = (function () {
  const config = loadConfig()
  // const config = {
  //   exts,
  //   alias: {
  //     '@api':
  //       'E:\\数据资产项目\\dmafe_git\\datamanagement\\vue_project\\asset_manage\\src\\api',
  //     '@':
  //       'E:\\数据资产项目\\dmafe_git\\datamanagement\\vue_project\\asset_manage\\src',
  //     '@views':
  //       'E:\\数据资产项目\\dmafe_git\\datamanagement\\vue_project\\asset_manage\\src\\views',
  //     '@com':
  //       'E:\\数据资产项目\\dmafe_git\\datamanagement\\vue_project\\asset_manage\\src\\components',
  //     '@store':
  //       'E:\\数据资产项目\\dmafe_git\\datamanagement\\vue_project\\asset_manage\\src\\store',
  //     '@common-components':
  //       'E:\\数据资产项目\\dmafe_git\\datamanagement\\vue_project\\common\\components',
  //     '@common-config':
  //       'E:\\数据资产项目\\dmafe_git\\datamanagement\\vue_project\\common\\config',
  //   },
  // }
  return function () {
    return config
  }
})()

module.exports = getConfig
