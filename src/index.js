const fs = require('fs')
const path = require('path')

const getConfig = require('./utils/getConfig')
const depAnalyse = require('./utils/depAnalyse')

console.log(getConfig());


// const coverConfig = getConfig()

depAnalyse(root, coverConfig.entry)



