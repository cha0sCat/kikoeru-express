# Kikoeru
一个同人音声专用的音乐流媒体服务器，详细的使用说明见[**用户文档**](./%E7%94%A8%E6%88%B7%E6%96%87%E6%A1%A3.md)


### 功能介绍
- 从 DLSite 爬取音声元数据
- 通过标签或关键字快速检索想要找到的音声
- 根据音声元数据对检索结果进行排序
- 可以选择通过 JWT 验证用户或关闭用户认证功能
- 支持在 Web 端修改配置文件和扫描音声库
- 支持为音声库添加多个根文件夹

### 源码安装部署
将kikoeru-quasar项目生成的SPA文件夹全部文件置于`dist`文件夹下，确保`dist/index.html`存在，然后：
```bash
# 安装依赖
npm install

# 启动服务器
npm start

# Express listening on http://[::]:8888
```
本项目还有打包好的 **Windows 系统下可用的 exe 可执行文件**与 **docker 镜像**版本，docker镜像及docker-compose的使用说明详见[**用户文档**](./%E7%94%A8%E6%88%B7%E6%96%87%E6%A1%A3.md)  
使用docker-compose只需调整`docker-compose.yml`内的挂载位置以符合您的存储路径即可。

### 技术栈
- axios (网络请求)
- express (构建后端服务)
- sqlite3 (文件型数据库)
- knexjs (操作数据库)
- knex-migrate (数据库迁移)
- cheerio (将 html 解析为 jQuery 对象)
- jsonwebtoken (用户认证)
- socket.io (用于将扫描音声库的结果实时传给客户端)
- lrc-file-parser (解析播放LRC歌词文件)
- jschardet (判断文本文件编码)
- child_process (nodejs 子进程)
- pkg (打包为可执行文件)


### 项目目录结构
```
├── auth/                    # 用户认证相关路由
├── config/                  # 存放配置文件
├── covers/                  # 存放音声封面
├── database/                # 操作数据库相关代码
├── dist/                    # 存放前端项目 kikoeru-quasar 构建的 SPA
├── filesystem/              # 存放扫描相关代码
├── package/                 # 存放 pkg 打包后的可执行文件
├── scraper/                 # 存放爬虫相关代码
├── sqlite/                  # 存放 sqlite 数据库文件
├── static/                  # 存放静态资源
├── .gitignore               # git 忽略路径
├── api.js                   # 为 express 实例添加路由与 jwt 验证中间件
├── app.js                   # 项目入口文件
├── config.js                # 用于生成与修改 config.json 配置文件
├── Dockerfile               # 用于构建 docker 镜像的文本文件
├── package.json             # npm 脚本和依赖项
└── routes.js                # 主要路由
```


### TODO
- [x] 可拖动歌词控件
- [x] 二级页面返回按钮
- [x] 手动星标
- [x] 评价过的作品优先
- [x] 星标前端 CRUD
- [x] 星标后端 CRUD
- [x] 进度标记页面
- [x] 用户评价
- [x] 修复面条代码里的placeholders
- [x] 升级sqlite等
- [ ] 刷新元数据
- [x] 不清理作品
- [x] 修复扫描阻塞
- [ ] 使用ID标识文件夹
- [ ] 整理路由等
- [ ] 单元测试、CI
- [ ] Insersection Observer
- [ ] 可编辑标签
- [ ] 重新扫描
- [ ] Dark Mode
- [ ] 重构WorkCard和WorkDetail
- [ ] 使用vuex重构收藏
- [x] 检查启用foreign key是否会出错
- [ ] 导入导出评价、进度
- [ ] 重构config和schema，添加多用户支持（目前实际上仍然是单用户架构）
- [ ] 重构鉴权逻辑, cookie, CSRF, 不向管理员传递md5 salt...
- [x] Knex error catch
- [x] 写迁移脚本
- [x] 重写创建数据库逻辑（与迁移脚本冲突了）
- [ ] 播放列表功能（目前只有一个）
- [ ] docker适当的权限与进程监控
- [ ] 添加计划任务，定期更新音声的动态元数据
- [ ] 手动添加音声
- [x] 首次扫描bug
- [x] 扫描设置

### 感谢
本项目的大部分后端代码来自于开源项目 [kikoeru](https://github.com/nortonandrews/kikoeru)
