'use strict';

// Search repos which repo's name match 'blog' and write to blogs.json && README.md.
// Usage: node build.js githubusername githubpassword

var fs = require('fs')
var _ = require('underscore')
var request = require('request')
var config = require('../config')

if (process.argv.length < 4) {
  console.log(process.argv)
  console.error('Not find username and password, use with :" node build.js username password ".')
  process.exit(1)
}

var username = process.argv[2]
var password = process.argv[3]

var list = []
searchBlogs(1)

// Search blogs from github,
// Api: https://developer.github.com/v3/search/#search-repositories,
// 为了防止请求限制超过github上限，所有请求串行发出.
function searchBlogs(page) {
  console.log('Start get blogs from page: ' + page + ' ...')
  request.get({
    url: 'https://api.github.com/search/repositories?q=blog+in:name+stars:>=' + config.minRequiredStarCount + '&order=desc&page=' + page,
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
      list = list.concat(data.items)
      if (data.incomplete_results == true
        // 超过github的reponse数量限制
        || list.length >= config.searchResponseMaxCount) {
        // End search.
        generateBlogsFromList()
      } else {
        // For unauthenticated requests, the rate limit allows you to make up to 10 requests per minute.
        // See: https://developer.github.com/v3/search/#rate-limit
        setTimeout(function() {
          searchBlogs(page + 1)
        }, 5000)
      }
    } else {
      console.error(err, response)
    }
  })
}

function generateBlogsFromList() {
  // 移除非blog的repo.
  removeIgnoreRepos()
  // 添加指定的blog的repo，从第0个开始递归添加.
  appendExtRepos(0)
}

function writeBlogListToReadme(blogs) {
  console.log('writing to readme ...')
  blogs.sort(function(a, b) {
    return b.stargazers_count - a.stargazers_count
  })
  var template = '' + fs.readFileSync(__dirname + '/list.md')
  var mdHead = '' + fs.readFileSync(__dirname + '/../_README.md')
  var md = mdHead.replace('{BLOGS_LIST}', _.template(template)({
    blogs: blogs
  }))
  fs.writeFileSync(__dirname + '/../blogs.json', JSON.stringify(blogs))
  fs.writeFileSync(__dirname + '/../README.md', md)
}

function removeIgnoreRepos() {
  list = _.filter(list, function(item) {
    if (item.open_issues_count >= 1
      && item.name == 'blog'
      && config.ignoreRepos.indexOf(item.full_name) == -1) {
      return true
    } else {
      return false
    }
  })
}

function appendExtRepos(index) {
  if (config.extRepos.length <= index) {
    // 所有指定的repo都添加完毕到list中，最后写入结果到readme和blogs.json.
    var blogs = list.map(function(item) {
      return {
        full_name: item.full_name,
        open_issues_count: item.open_issues_count,
        html_url: item.html_url,
        stargazers_count: item.stargazers_count
      }
    })
    writeBlogListToReadme(blogs)
  } else {
    var fullName = config.extRepos[index]
    console.log('Get detail of ext repo: ' + fullName)
    request.get({
      url: 'https://api.github.com/repos/' + fullName,
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
        list.push(data)
        appendExtRepos(index + 1)
      } else {
        console.error(err, response)
      }
    })
  }
}