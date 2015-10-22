'use strict';

// 自动抓取新增的博客。
// 抓取时间范围为上周创建。
// Usage: node harvest.js githubusername githubpassword

var request = require('request')
var moment = require('moment')
var fs = require('fs')
var _ = require('underscore')

if (process.argv.length < 4) {
  console.log(process.argv)
  console.error('Not find username and password, use with :" node harvest.js username password ".')
  process.exit(1)
}

var username = process.argv[2]
var password = process.argv[3]

var blogList = require('../blogs.json')
var newIssues = []
// 收割上一周的博客
var startDate = moment().add(-1, 'weeks').startOf('week').format('YYYY-MM-DD')
var endDate = moment().add(-1, 'weeks').endOf('week').format('YYYY-MM-DD')
console.log('get blog which post in ' + startDate + ' - ' + endDate)

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
    auth: {
      user: username,
      pass: password
    },
    headers: {
      'User-Agent': 'request'
    }
  }, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      var data = JSON.parse(body)
      for (var i = 0; i < data.length; i ++) {
        var item = data[i]
        var createdDate = moment(item.created_at).format('YYYY-MM-DD')
        if (createdDate <= endDate
          && createdDate >= startDate
          && item.body.length > 200) {
          // New one which post at yesterday.
          if (item.user.login == repo.split('/')[0]) {
            console.log('get a issue: ' + item.title)
            newIssues.push(item)
          }
        } else if (createdDate < endDate) {
          // Too old.
          break
        }
      }
      getIssuesFromRepo(index + 1)
    } else {
      console.error(err, response)
    }
  })
}

function generateNewBlogs() {
  var template = '' + fs.readFileSync(__dirname + '/new.md')
  var date = startDate + ' - ' + endDate
  var md = _.template(template)({
    items: newIssues,
    date: date
  })
  fs.writeFileSync(__dirname + '/../news/' + date + '.md', md)
}