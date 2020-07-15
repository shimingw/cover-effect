const { fork } = require('child_process')

const child = fork('src/cover.js', [
  {
    clonePath: __dirname,
    entry: './src/index.js',
    oldBranch: 'data_check_wangas_0215',
    newBranch: 'data_check_wangas_0406',
    alias: {
      '@assets': 'src/assets',
      '@store': 'src/store',
      '@views': 'src/views',
      '@server': 'src/server',
      '@components': 'src/components',
      '@util': 'src/util',
    },
  },
])

// console.log(child)
