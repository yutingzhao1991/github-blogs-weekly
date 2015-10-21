<% for (var i = 0; i < blogs.length; i ++) {
  var blog = blogs[i]
%>
- [<%= blog.full_name %>(<%= blog.open_issues_count %>)](<%= blog.html_url %>) ✯<%= blog.stargazers_count %>
<% } %>