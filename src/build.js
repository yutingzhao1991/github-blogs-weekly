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
  request.get({
    url: 'https://api.github.com/search/repositories?q=blog+in:name+stars:>=' + config.minRequiredStarCount + '&order=desc&page=' + page,
    headers: {
      'User-Agent': 'request'
    }
  }, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      var data = JSON.parse(body)
      list = list.concat(data.items)
      if (data.incomplete_results == true
        || data.items[0].name != 'blog'
        || PER_PAGE_COUNT * page >= config.searchResponseMaxCount) {
        // End search.
        var blogs = generateBlogsFromList()
        writeBlogListToReadme(blogs)
      } else {
        searchBlogs(page + 1)
      }
    } else {
      console.error(err)
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
}

function writeBlogListToReadme(blogs) {
  var template = '' + fs.readFileSync(__dirname + '/list.md')
  var mdHead = '' + fs.readFileSync(__dirname + '/../_README.md')
  var md = mdHead + _.template(template)({
    blogs: blogs
  })
  fs.writeFileSync(__dirname + '/../blogs.json', {
    blogs: blogs
  })
  fs.writeFileSync(__dirname + '/../README.md', md)
}

function filterBlogs() {
  // TODO
}

function appendExtRepos() {
  // TODO
}