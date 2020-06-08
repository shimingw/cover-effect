const shell = require('shelljs')
const diffSummary = require('./diffSummary')
const a = 'master'
const b = 'test'
let text = shell.exec(`git diff ${a} ${b} --stat`).cat()

console.log(diffSummary.parse(text).files)
