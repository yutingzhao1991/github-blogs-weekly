<% for (var i = 0; i < items.length; i ++) {
  var item = items[i]
%>
- [<%= item.title %>](<%= item.html_url %>) （<%= item.user.login %>）
<% } %>