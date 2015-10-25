GITHUB-BLOGS 收集GITHUB上的博客
===

自动收集GITHUB上用ISSUES写的博客，**watching本repo就可以获得定期推送**，当前的推送方式是每周日会新建一个[ISSUE](https://github.com/yutingzhao1991/github-blogs/labels/Articles)将之前一周的更新博客整理到一起。

建议watching本项目获取博客更新，保证能够获取到更新的同时减少干扰。如果你对某个博客感兴趣，建议star以鼓励作者。

收集和更新规则
---

- repo名称为blog
- `config.json`的ignoreRepos中的列表会被过滤，extRepos中的列表会被额外补充上，欢迎提pr修改
- star >= 5
- open issue 数 >= 1
- 列表不定期手动更新
- 作者为本人的且字数大于200的会每加入推送列表中
- 每周日早晨会自动将之前一周的博客整理为一个issue自动发布到本项目中

博客列表
---

{BLOGS_LIST}

TODOLIST
---

- 分类
- 通过邮件列表提醒
- 支持RSS订阅

License
---

ISC