'use strict';

var request = require('request')

var blogList = require('../blogs.json').blogs
var newIssues = []
var lastUpdateDate = new Date().setHours(0).setMinutes(0).setSeconds(0)

getIssuesFromRepo(0)

function getIssuesFromRepo(index) {
  // 递归抓去更新的issue.
  if (index >= blogList.length) {
    generateNewBlogs()
    return
  }
  request({
    url: 'https://api.github.com/repos/' + repo + '/issues',
    headers: {
      'User-Agent': 'request'
    }
  }, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      var data = JSON.parse(body)
      data.forEach(function(item) {
        if (new Date(item.created_at).getTime() >= lastUpdateDate.getTime)) {
          // New one.
          newIssues.push(item)
        }
      })
      getIssuesFromRepo(index + 1)
    } else {
      console.error(err)
    }
  })
}

function generateNewBlogs() {
  var template = '' + fs.readFileSync(__dirname + '/list.md')
  var date = lastUpdateDate.getFullYear() + '-' + (lastUpdateDate.getMonth() + 1) + '-' + lastUpdateDate.getDate)()
  var md = _.template(template)({
    items: newIssues,
    date: date
  })
  fs.writeFileSync(__dirname + '/../news/' + date + '.md', md)
}