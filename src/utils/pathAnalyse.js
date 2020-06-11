const fs = require('fs')
const path = require('path')
const promisify = require('util-promisify')
const config = require('./getConfig')()
const stat = promisify(fs.stat)

function getAbsolutePath(curPath, relativePath) {
  if (path.isAbsolute(relativePath)) {
    return path.normalize(relativePath)
  } else {
    return path.join(curPath, relativePath)
  }
}

function importPathTransform(curPath, relativePath) {
  // TODO:这里要进行文件后缀名匹配
  // 解析命名别名
  relativePath = replaceAlias(relativePath)

  // 将相对路径转化成绝对路径
  const absolutePath = getAbsolutePath(curPath, relativePath)

  // 对路径进行index及后缀匹配
  return getVaildPath(absolutePath)
}

function replaceAlias(relativePath) {
  const { alias } = config
  for (const [key, value] of Object.entries(alias)) {
    if (relativePath.includes(key)) {
      relativePath = relativePath.replace(key, value)
      break
    }
  }
  return relativePath
}

function getVaildPath(filePath, ext) {
  return stat(filePath)
    .then((stats) => {
      if (stats.isFile()) {
        // 如果是文件则直接返回路径
        return filePath
      } else {
        // 如果是目录则进行
        // +index +后缀进行匹配
        return matchSuffix(path.join(filePath, 'index'))
      }
    })
    .catch((e) => {
      if (path.extname(filePath)) {
        // 已存在后缀则无需匹配
        return false
      } else {
        return matchSuffix(filePath)
      }
    })
}

async function matchSuffix(filePath) {
  const { exts } = config

  for (const ext of exts) {
    const guessPath = `${filePath}${ext}`
    const rst = await getVaildPath(guessPath)
    if (rst) return rst
  }
}

function isJsFilePath(filePath) {
  const ext = path.extname(filePath)
  const exts = ['.js', '.vue', '.jsx']
  return exts.includes(ext)
}

module.exports = {
  importPathTransform,
  getAbsolutePath,
  isJsFilePath
}
