'use strict';

// Not avaliable now.

var request = require('request')
var moment = require('moment')

var blogList = require('../blogs.json')
var newIssues = []
var yesterday = moment().add(-1, 'days').format('YYYY-MM-DD')

getIssuesFromRepo(0)

function getIssuesFromRepo(index) {
  // 递归抓去更新的issue.
  if (index >= blogList.length) {
    generateNewBlogs()
    return
  }
  var repo = blogList[index].full_name
  console.log('Start get issues from repo: ' + repo + ' ...')
  request({
    url: 'https://api.github.com/repos/' + repo + '/issues?sort=created&direction=desc',
    headers: {
      'User-Agent': 'request'
    }
  }, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      var data = JSON.parse(body)
      for (var i = 0; i < data.length; i ++) {
        if (moment(item.created_at).format('YYYY-MM-DD') == yesterday) {
          // New one which post at yesterday.
          newIssues.push(item)
        } else if (moment(item.created_at).format('YYYY-MM-DD') < yesterday) {
          // Too old.
          break
        }
      }
      getIssuesFromRepo(index + 1)
    } else {
      console.error(err)
    }
  })
}

function generateNewBlogs() {
  var template = '' + fs.readFileSync(__dirname + '/list.md')
  var date = lastUpdateDate.getFullYear() + '-' + (lastUpdateDate.getMonth() + 1) + '-' + lastUpdateDate.getDate()
  var md = _.template(template)({
    items: newIssues,
    date: date
  })
  fs.writeFileSync(__dirname + '/../news/' + date + '.md', md)
}