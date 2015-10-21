'use strict';

var fs = require('fs')
var _ = require('underscore')
var request = require('request')

// search blogs from github
// api: https://developer.github.com/v3/search/#search-repositories
request.get({
  url: 'https://api.github.com/search/repositories?q=blog+in:name&sort=stars&order=desc',
  headers: {
    'User-Agent': 'request'
  }
}, function (err, response, body) {
  if (!err && response.statusCode == 200) {
    var data = JSON.parse(body)
    writeBlogListToReadme(data)
  } else {
    console.error(err)
  }
})

function writeBlogListToReadme(data) {
  var template = '' + fs.readFileSync(__dirname + '/list.md')
  var mdHead = '' + fs.readFileSync(__dirname + '/../_README.md')
  var md = mdHead + _.template(template)(data)
  fs.writeFileSync(__dirname + '/../README.md', md)
}