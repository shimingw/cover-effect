// TODO: 测试判断路径是否有效
const fs = require('fs')
const path = require('path')
const promisify = require('util-promisify')
const stat = promisify(fs.stat)
const exts = ['js', 'vue', 'jsx', 'json', 'svg', 'png', 'jpg']

const filePath = 'E:\\代码影响范围评估工具\\example\\src\\moduleB'

// 如果err了，需要进行后缀名的匹配
// 如果成功了判断是不是文件，是文件则增加index以及后缀进行匹配
// 如果是文件则可以直接读取
// console.log(err,stats)
// console.log(stats.isFile());

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
  for (const ext of exts) {
    const guessPath = `${filePath}.${ext}`
    const rst = await getVaildPath(guessPath)
    if (rst) return rst
  }
}
// console.log(
//   checkPath(filePath).then((s) => {
//     console.log(s)
//   })
// )

getVaildPath(filePath).then((data) => {
  console.log(data)
})
// http://nodejs.cn/api/fs.html#fs_fs_stat_path_options_callback
// http://nodejs.cn/api/fs.html#fs_class_fs_stats
