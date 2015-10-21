<% for (var i = 0; i < items.length; i ++) {
  var item = items[i]
%>
- [<%= item.full_name %>(<%= item.open_issues_count %>)](<%= item.html_url %>) ✯<%= item.stargazers_count %>
<% } %>