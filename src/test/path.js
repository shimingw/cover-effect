const {
  importPathTransform,
  getAbsolutePath,
  isJsFilePath
} = require('../utils/pathAnalyse')

const config = require('../utils/getConfig')()

const curPath = 'E:\\数据资产项目\\dmafe_git\\datamanagement\\vue_project\\asset_manage\\src'
const depFilePath = './router/index'

importPathTransform(curPath, depFilePath).then(data => {
  console.log(data)
})
