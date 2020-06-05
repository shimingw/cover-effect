const path = require('path')
const fs = require('fs')

function loadConfig(fileName) {
  // const filePath = path.join(process.cwd(), fileName)
  const root = path.join(__dirname,'../../example/app')
  const filePath = path.join(root, fileName)
  const config = require(filePath)
  config.base = root
  return config
}

const getConfig = (function (fileName = './.cover.js') {
  const config = loadConfig(fileName)
  return function () {
    return config
  }
})()

module.exports = getConfig
