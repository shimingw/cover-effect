const path = require('path')
module.exports = {
  entry: './index.js',
  oldBranch: 'test',
  newBranch: 'master',
  alias:{
    '@a': path.join(__dirname, 'src', 'moduleA'),
    '@b': path.join(__dirname, 'src', 'moduleB'),
  }
}