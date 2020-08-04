## 介绍

这是一个代码影响范围评估工具，可以对两个分支的`diff`文件，进行分析，获取每个文件的依赖影响以及文件描述。本工具支持对`.vue`、`.jsx`、`.js`文件进行分析

## 安装

`npm install -S cover-effect`

## 配置
**配置文件**

安装根目录下创建`.cover.js`配置文件
```js
const path = require('path')

module.exports = {
  entry: './index.js',  // 项目入口
  oldBranch: 'test',    // 需要对比的老分支
  newBranch: 'master',  // 需要对比的新分支
  alias:{               // 配置webpack中的路径别名
    '@a': path.join(__dirname, 'src', 'moduleA'),
    '@b': path.join(__dirname, 'src', 'moduleB'),
  }
}
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

## 使用
在根目录下执行`npx cover`，即可生成名为`depAnalyse.html`的依赖分析文件。