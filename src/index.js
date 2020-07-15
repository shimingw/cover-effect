module.exports = function (options) {
  return new Promise((resolve, reject) => {
    const { fork } = require('child_process')
    const child = fork('src/cover.js')
    child.on('message', (message) => {
      if (message.status === 'success') {
        child.kill()
        resolve(message.data)
      }
      if (message.status === 'error') {
        // 杀死子进程
        child.kill()
        reject(message.data)
      }
    })
    child.send({
      status: 'start',
      options,
    })
  })
}
