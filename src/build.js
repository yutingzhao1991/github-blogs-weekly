'use strict';

// Search repos which repo's name match 'blog' and write to blogs.json && README.md.

var fs = require('fs')
var _ = require('underscore')
var request = require('request')
var config = require('../config')

var list = []
searchBlogs(1)

// Search blogs from github
// Api: https://developer.github.com/v3/search/#search-repositories
function searchBlogs(page) {
  console.log('Start get blogs from page: ' + page + ' ...')
  request.get({
    url: 'https://api.github.com/search/repositories?q=blog+in:name+stars:>=' + config.minRequiredStarCount + '&order=desc&page=' + page,
    headers: {
      'User-Agent': 'request'
    }
  }, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      var data = JSON.parse(body)
      list = list.concat(data.items)
      if (data.incomplete_results == true || page > 2) {
        // End search.
        var blogs = generateBlogsFromList()
        writeBlogListToReadme(blogs)
      } else {
        // For unauthenticated requests, the rate limit allows you to make up to 10 requests per minute.
        // See: https://developer.github.com/v3/search/#rate-limit
        setTimeout(function() {
          searchBlogs(page + 1)
        }, 7500)
      }
    } else {
      console.error(err, response)
    }
  })
}

function generateBlogsFromList() {
  removeIgnoreRepos()
  appendExtRepos()
  var blogs = list.map(function(item) {
    return {
      full_name: item.full_name,
      open_issues_count: item.open_issues_count,
      html_url: item.html_url,
      stargazers_count: item.stargazers_count
    }
  })
  return blogs
}

function writeBlogListToReadme(blogs) {
  blogs.sort(function(a, b) {
    return b.stargazers_count - a.stargazers_count
  })
  var template = '' + fs.readFileSync(__dirname + '/list.md')
  var mdHead = '' + fs.readFileSync(__dirname + '/../_README.md')
  var md = mdHead.replace('{BLOGS_LIST}', _.template(template)({
    blogs: blogs
  }))
  fs.writeFileSync(__dirname + '/../blogs.json', {
    blogs: blogs
  })
  fs.writeFileSync(__dirname + '/../README.md', md)
}

function removeIgnoreRepos() {
  list = _.filter(list, function(item) {
    return item.open_issues_count >= 1 && item.name == 'blog'
  })
  // TODO: remove ignore repos which defined in config.
}

function appendExtRepos() {
  // TODO
}