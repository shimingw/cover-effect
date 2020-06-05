function getCommentBlock(comments) {
  const commentBlock = comments.find((comment) => {
    if (comment.type !== 'CommentBlock') return false
    const value = comment.value
    // TODO: 这里应该是个变量，默认值为@Description
    return value.includes('@Description')
  })
  return commentBlock ? commentBlock.value : undefined
}

function compileCommentBlock(commentBlock) {
  // 是否采用key，value的形式
  const paramsList = commentBlock.replace(/\*|\s/g, '').match(/@([^@]+)/g)
  const params = paramsList.map((params) => {
    const index = params.indexOf(':')
    const key = params.substring(1, index)
    const val = params.substring(index+1)
    return {
      [key]: val,
    }
  })
  return params
}

module.exports = {
  getCommentBlock,
  compileCommentBlock,
}
