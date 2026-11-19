# dsh-plugin-yu-comments

一个 [DeepSeek Harness](https://github.com/deepseek-ai)（DSH）侧边栏插件：点开鱼形图标，左边是**评论存档**，右边是**个人中心**——人设、记忆、复盘、设置都在一个面板里，不用再开网页。

> A DSH sidebar plugin that renders a comment archive plus a profile panel (persona / memory / review / settings) from a local HTTP service. No build step, no dependencies, no network egress beyond `127.0.0.1`.

- 侧边栏只有一个入口，面板内两个视图：**评论记录** / **个人中心**
- 评论记录：日期归档、关键词搜索、列表 / 缩略图 / 大图三种视图、封面懒加载、每 60 秒自刷新
- 个人中心：概览（今日、人格链、24 小时作息、工人心跳、闸门）、人设、记忆、复盘、白名单设置表单
- 文案跟随 DSH 中英文切换（`locale/` + `locale.register`）
- 纯前端渲染 + 一个负责「拉起本地服务」的 Host 半边，没有打包器

## 目录

```text
.
├─ package.json         dsh.bundle.patch + dsh.client(platform: web)
├─ cordis.patch.yml     insert 一行 yu-comments
├─ index.js             Host 半边：探测 /api/state，掉线就拉起本地服务
├─ client.js            Web Client：注册 sidebar.panellist 图标 + main 面板
├─ locale/{zh,en}.json  Plugin Manager 里显示的标题与描述
├─ icon.svg             侧边栏与插件列表图标
├─ mock/server.mjs      零依赖 mock 后端，全合成数据
├─ tools/check_panel.mjs 面板自检：迷你 React 真渲染 + 真发 HTTP
└─ docs/API.md          本地服务接口契约
```

## 数据从哪来

面板不直接读数据库，只跟一个本地服务说话（默认 `http://127.0.0.1:8848`）：

```text
GET  /api/state          存活探测
GET  /api/records        评论列表（limit / day / q / offset）
GET  /covers/<file>      封面图
GET  /api/me             个人中心聚合数据
POST /api/me/settings    保存设置
GET  /api/workers        POST /api/workers    工人状态 / 开关
GET  /api/clock          POST /api/clock      生物钟
```

完整字段见 [docs/API.md](docs/API.md)。换地址不用改源码：

```js
window.__YU_COMMENTS_API__ = 'http://127.0.0.1:9000';
// 或
localStorage.setItem('yu-comments.api', 'http://127.0.0.1:9000');
```

## 先看效果：跑 mock

```bash
node mock/server.mjs          # 默认 8848，加 --port 9000 换端口
# 另开一个终端
node tools/check_panel.mjs --api http://127.0.0.1:8848
```

`mock/server.mjs` 是零依赖的合成后端（示例评论、示例人设、示例记忆），装插件前后都能用来验证面板。自检脚本会把 `client.js` 真加载、真渲染整棵树，断言侧边栏只有一个图标、两个视图能切、五个分页能点开、设置能提交、页面里不出现 `sk-` / `SESSDATA`。

## 安装到 DSH

准备：一个 DSH 桌面版 profile（默认在 `~/.dsh/profiles/desktop`），把本仓库放在任意目录。

1. 加依赖（`link:` 指向本仓库，改完不用重新安装）：

   ```json
   // ~/.dsh/profiles/desktop/package.json
   {
     "dependencies": {
       "dsh-plugin-yu-comments": "link:../path/to/dsh-plugin-yu-comments"
     }
   }
   ```

2. 这一行也进 profile 的 `dsh.profile.bundles`：

   ```json
   { "dsh": { "profile": { "bundles": ["dsh-plugin-yu-comments"] } } }
   ```

3. 在 profile 目录装一次（建 junction，不下载）：

   ```bash
   npm install --no-audit --no-fund
   ```

4. 重启 DSH Host。侧边栏出现鱼形图标；新增 bundle 必须重启一次才生效。

## 配置

`cordis.patch.yml` 里可调：

| 键 | 默认 | 说明 |
|---|---|---|
| `port` | `8848` | 本地服务端口，必须和面板 API 地址一致 |
| `projectDir` | `''` | 服务代码目录；空 = 进程当前目录 |
| `python` | `pythonw` | 拉起服务用的解释器；Windows 用 `pythonw` 不闪黑框 |
| `supervise` | `true` | 掉线是否自动拉起；关掉就完全手动 |
| `intervalMs` | `30000` | 复查间隔（毫秒，下限 5000） |

也可以用环境变量：`YU_COMMENTS_PORT`、`YU_COMMENTS_DIR`、`YU_COMMENTS_PYTHON`。

**自动拉起的三层**（按需取舍）：

1. 插件 Host 半边：激活时探测 `/api/state`，连不上就 `spawn <python> <projectDir>/web.py --port <port>`，之后每 30 秒复查，插件释放时结束自己拉起的子进程
2. 系统开机自启：把启动命令做成快捷方式丢进启动目录（Windows：`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`）
3. 手动：任何把服务跑在 `127.0.0.1:<port>` 的方式都行，包括 `node mock/server.mjs`

只想看面板、不接自己的服务时，把 `supervise` 设 `false`，再手动跑 mock。

## 自检

```bash
node mock/server.mjs &          # 或者你已经有一个跑在 8848 的服务
node tools/check_panel.mjs --api http://127.0.0.1:8848
```

退出码 0 = 全过。它不依赖浏览器：自带的迷你 React 会真跑 `client.js` 的组件树，真打 HTTP，断言文字树而不是快照。

## 隐私

- 插件只连 `127.0.0.1`，没有遥测、没有外部上报、没有第三方脚本
- 服务端返回什么就显示什么；仓库里的 mock 全是合成数据
- 面板不显示、也不请求任何 cookie / token / API key；自检里有一条专门断言页面文本不含 `sk-` 和 `SESSDATA`
- 如果你接的是自己的机器人服务，凭证请放在服务端配置里，别塞进前端

## 兼容性

- DSH 桌面版（`platform: web` 的 client 半边）
- Node.js ≥ 18（mock 与自检脚本）
- 浏览器：Chromium / Edge / Safari 近两年版本（用到 `color-mix()`，旧浏览器只是配色退化）

## License

[MIT](LICENSE)
