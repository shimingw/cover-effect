## 介绍

这是一个代码影响范围评估工具，可以对两个分支的`diff`文件，进行分析，获取每个文件的依赖影响以及文件描述。本工具支持对`.vue`、`.jsx`、`.js`文件进行分析

## 安装

`npm install -S sncover`

## 使用

```js
const cover = require('sncover')
const coverExamle = new cover({
  clonePath: __dirname, //将仓库clone至指定目录
  entry: './src/index.js', // 仓库入口文件
  oldBranch: 'data_check_wangas_0215', //需要比较的老分支
  newBranch: 'data_check_wangas_0406', //需要比较的新分支
  alias: {
    // webpack中的alias，以仓库为根目录的相对路径
    '@assets': 'src/assets',
    '@store': 'src/store',
    '@views': 'src/views',
    '@server': 'src/server',
    '@components': 'src/components',
    '@util': 'src/util',
  },
})

coverExamle.getEffectScopeData().then((data) => {
  console.log('获取最终数据:', data)
})
```

**文件描述配置**

在文件中以块级注释的形式配置文件描述，目前仅支持一下字段的文件描述（文件描述、创建者、创建时间、最后修改时间、最后修改人）。后续可进行自定义配置

```js
/*
 * @Description: 入口文件
 * @Author: shimingwen
 * @Date: 2020-06-04 14:35:31
 * @LastEditTime: 2020-06-04 18:01:39
 * @LastEditors: shimingwen
 */
```
