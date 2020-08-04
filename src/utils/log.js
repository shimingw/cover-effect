const chalk = require('chalk')

function errorLog (msg) {
  msg = typeof msg === 'object' ? JSON.stringify(msg, null, 4) : msg
  console.log(chalk.red(`error : ${msg}`))
  process.exit(1)
}

module.exports = {
  errorLog
}
