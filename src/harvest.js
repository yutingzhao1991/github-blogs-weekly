'use strict';

// 自动抓取新增的博客，并通过issue的形式发布。
// 抓取时间默认范围为上周创建。
// Usage: node harvest.js githubusername githubpassword [start_date] [end_date].

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
var startDate = process.argv[4] || moment().add(-1, 'weeks').startOf('week').format('YYYY-MM-DD')
var endDate = process.argv[5] || moment().add(-1, 'weeks').endOf('week').format('YYYY-MM-DD')
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
            console.log('get a article: ' + item.title)
            newIssues.push(item)
          }
        } else if (createdDate < startDate) {
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
  if (newIssues.length == 0) {
    console.log('notfind new articles')
    return
  }
  var template = '' + fs.readFileSync(__dirname + '/new.md')
  var date = startDate + ' - ' + endDate
  var md = _.template(template)({
    items: newIssues,
    date: date
  })
  fs.writeFileSync(__dirname + '/../news/' + date + '.md', md)
  // Publish new blogs as a issue.
  console.log('Publish new article to your issue.')
  request({
    url: 'https://api.github.com/repos/' + username + '/github-blogs/issues',
    method: 'POST',
    body: JSON.stringify({
      title: '文章更新 [ ' + date + ' ]',
      body: md,
      labels: ['Articles']
    }),
    auth: {
      user: username,
      pass: password
    },
    headers: {
      'User-Agent': 'request'
    }
  }, function (err, response, body) {
    if (!err && response.statusCode >= 200 && response.statusCode < 300) {
      console.log('Created issue done!')
    } else {
      console.error(err, response)
    }
  })
}