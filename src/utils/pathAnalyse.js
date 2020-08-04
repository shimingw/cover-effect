const fs = require('fs')
const path = require('path')
const promisify = require('util-promisify')
const stat = promisify(fs.stat)

function getAbsolutePath (curPath, relativePath) {
  if (path.isAbsolute(relativePath)) {
    return path.normalize(relativePath)
  } else {
    return path.join(curPath, relativePath)
  }
}

/**
 * @param {*} curPath 被解析的当前文件的路径
 * @param {*} relativePath 被依赖文件（import）文件的路径
 * @returns
 */
async function importPathTransform (curPath, relativePath, alias) {
  // TODO:这里要进行文件后缀名匹配
  // 解析命名别名
  relativePath = replaceAlias(relativePath, alias)

  // 将相对路径转化成绝对路径
  const absolutePath = getAbsolutePath(curPath, relativePath)

  // 对路径进行index及后缀匹配
  return await getVaildPath(absolutePath)
}

function replaceAlias (relativePath, alias) {
  const pathHead = getPathHead(relativePath)
  const aliasPath = alias[pathHead]
  if (aliasPath === undefined) return relativePath
  relativePath = path.join(aliasPath, relativePath.replace(pathHead, ''))
  return relativePath
}

function getPathHead (filePath) {
  const indexSlash = filePath.indexOf('/')
  const subDepFilePath =
    indexSlash === -1 ? filePath : filePath.substring(0, indexSlash)
  return subDepFilePath
}

async function getVaildPath (filePath) {
  const ext = path.extname(filePath)
  // 第一步：查看路径是否有后缀名，有则直接返回
  if (ext) {
    return filePath
  }

  // 第二步：如果没有后缀则进行文件后缀名匹配
  let guessPath = await matchSuffix(filePath)
  if (guessPath) return guessPath

  // 第三步：如果匹配都失败，则+index继续进行文件后缀名匹配
  guessPath = await matchSuffix(path.join(filePath, 'index'))
  return guessPath
  // return stat(filePath)
  //   .then((stats) => {
  //     if (stats.isFile()) {
  //       // 如果是文件则直接返回路径
  //       return filePath
  //     } else {
  //       // 如果是目录则进行
  //       // +index +后缀进行匹配
  //       return matchSuffix()
  //     }
  //   })
  //   .catch((e) => {
  //     if (path.extname(filePath)) {
  //       // 已存在后缀则无需匹配
  //       return false
  //     } else {
  //       return matchSuffix(filePath)
  //     }
  //   })
}

async function matchSuffix (filePath) {
  const exts = ['.js', '.vue', '.jsx', '.json', '.svg', '.png', '.jpg']
  for (const ext of exts) {
    const guessPath = `${filePath}${ext}`
    const rst = await isFile(guessPath)
    if (rst) return rst
  }
}

function isFile (filePath) {
  return stat(filePath)
    .then((stats) => {
      return stats.isFile() ? filePath : false
    })
    .catch((e) => {
      return false
    })
}

function isJsFilePath (filePath) {
  const ext = path.extname(filePath)
  const exts = ['.js', '.vue', '.jsx']
  return exts.includes(ext)
}

module.exports = {
  importPathTransform,
  getAbsolutePath,
  isJsFilePath,
  getPathHead
}
