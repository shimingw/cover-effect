const path = require('path')
const fs = require('fs')

function loadConfig(fileName) {
  const coverPath = path.join(process.cwd(), '.cover.js')
  const config = require(coverPath)
  config.base = path.dirname(coverPath)
  return config
}

const getConfig = (function () {
  const config = loadConfig()
  return function () {
    return config
  }
})()

module.exports = getConfig
