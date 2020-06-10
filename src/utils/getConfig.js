const path = require('path')
const fs = require('fs')

const exts = ['js', 'vue', 'jsx', 'json', 'svg', 'png', 'jpg']


function loadConfig(fileName) {
  const coverPath = path.join(process.cwd(), '.cover.js')
  const config = require(coverPath)
  config.base = path.dirname(coverPath)
  config.exts = config.exts ? config.exts : exts
  return config
}

const getConfig = (function () {
  const config = loadConfig()
  return function () {
    return config
  }
})()

module.exports = getConfig
