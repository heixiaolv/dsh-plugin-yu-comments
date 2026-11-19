# dsh-plugin-yu-comments

[![npm version](https://img.shields.io/npm/v/dsh-plugin-yu-comments.svg)](https://www.npmjs.com/package/dsh-plugin-yu-comments)
[![license](https://img.shields.io/npm/l/dsh-plugin-yu-comments.svg)](LICENSE)

一个 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）侧边栏插件：点开鱼形图标，左边是**评论存档**，右边是**个人中心**——人设、记忆、复盘、设置都在一个面板里，不用再开网页。

> A DSH sidebar plugin that renders a comment archive plus a profile panel (persona / memory / review / settings) from a local HTTP service. No build step, no npm dependencies, no network egress beyond `127.0.0.1`.

- **能力分类**：界面与体验
- **npm**：[`dsh-plugin-yu-comments`](https://www.npmjs.com/package/dsh-plugin-yu-comments)
- **License**：[MIT](LICENSE)
- **平台**：DSH 桌面版（`platform: web` 的 client 半边）
- 侧边栏只有一个入口，面板内两个视图：**评论记录** / **个人中心**
- 评论记录：日期归档、关键词搜索、列表 / 缩略图 / 大图三种视图、封面懒加载、每 60 秒自刷新
- 个人中心：概览（今日、人格链、24 小时作息、工人心跳、闸门）、人设、记忆、复盘、白名单设置表单
- 文案跟随 DSH 中英文切换（`locale/` + `locale.register`）
- 纯前端渲染 + 一个负责「拉起本地服务」的 Host 半边，没有打包器

## 安装

### 前置条件

| 场景 | 需要 |
|---|---|
| DSH 桌面版（应用内插件管理器） | 只要 DSH 本体，不需要额外装东西 |
| 命令行 `dsh plugin …` | Node.js ≥ 18 **+ pnpm**（`dsh plugin` 内部就是调 pnpm）：`npm i -g pnpm` |
| 面板出数据 | 一个跑在 `127.0.0.1:8848` 的本地记录服务，仓库自带 mock |

> `--profile` 必须和**实际被启动的 profile** 一致：桌面应用加载的是 `desktop`，`dsh web` / 浏览器版加载的是 `web`。装到没人启动的 profile 里，表现就是「装完了但没反应」。

### 方式一：桌面版应用内安装（最省事）

打开 DSH 的插件管理器（插件市场 / 设置里的插件页）→ 安装 → 填包名 `dsh-plugin-yu-comments` → 重启 DSH。

### 方式二：命令行（需要 pnpm）

```bash
npm i -g pnpm                                  # 已有 pnpm 可跳过
dsh plugin --profile web add dsh-plugin-yu-comments
```

装完重启 DSH Host，侧边栏出现鱼形图标。

### 方式三：手动注册 profile（没有 pnpm / 想跟着仓库改）

改 `~/.dsh/profiles/<你的 profile>/package.json`：

```json
{
  "dependencies": { "dsh-plugin-yu-comments": "^0.1.2" },
  "dsh": { "profile": { "bundles": ["dsh-plugin-yu-comments"] } }
}
```

```bash
cd ~/.dsh/profiles/<你的 profile>
npm install --no-audit --no-fund
```

重启 DSH Host。想改代码免重装，就把依赖写成 `"link:/绝对路径/dsh-plugin-yu-comments"`。

### 方式四：源码安装（跟仓库最新代码）

```bash
dsh plugin --profile web add github:heixiaolv/dsh-plugin-yu-comments
```

### 装完先看效果

插件本身装好后，面板还需要一个本地记录服务（默认 `127.0.0.1:8848`）。仓库/npm 包里自带零依赖的合成后端：

```bash
node mock/server.mjs                                      # 源码安装：在仓库目录跑
node node_modules/dsh-plugin-yu-comments/mock/server.mjs   # npm 包：在 profile 目录跑
```

面板几秒内自己出数据；不想让它自动拉起服务时，把 `supervise` 设成 `false` 再手动跑 mock。

## 装不起来 / 启动失败对照表

| 你看到的 | 真正原因 | 怎么办 |
|---|---|---|
| `'pnpm' is not recognized as an internal or external command` + `Command failed with exit code 1: pnpm add dsh-plugin-yu-comments` | `dsh plugin` 需要 pnpm，machine 上没有，**插件根本没装上** | `npm i -g pnpm` 后重试；或改用「方式一 / 方式三」 |
| `dsh: profile "xxx" does not exist` | `--profile` 名字写错 | 换成实际存在且会被启动的 profile（桌面版通常 `desktop`，浏览器版 `web`） |
| 命令成功、侧边栏却没有鱼形图标 | 装进了不会被启动的 profile，或没重启 Host | 检查 profile 对不对；完整重启 DSH |
| `dsh: skipping profile bundle "dsh-plugin-yu-comments": …` | 包没解析到 / 版本要求不满足 | 在 profile 目录重跑安装（`dsh plugin --profile X install`），或删掉重装 |
| 面板里写着「连不上本地记录服务」 | 插件**没坏**，是数据服务没跑 | 跑上面的 mock，或按 [docs/API.md](docs/API.md) 起自己的服务 |
| 面板一直转圈 | 服务在跑但接口字段不对 | 用 `curl 127.0.0.1:8848/api/state` 对照 docs/API.md 检查 |
| 白屏 / 控制台报找不到 `@deepseek-ai/dsh-client-ui-layout` | DSH 版本太旧，没有这个 client 包 | 升级 DSH，或在 issue 里附上 `dsh --version` |

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

1. 插件 Host 半边：激活时探测 `/api/state`，连不上就 `spawn <python> <projectDir>/web.py --port <port>`，之后每 30 秒复查；**找不到 `web.py` 时只提示一次就停手**（不会再刷日志），插件释放时结束自己拉起的子进程
2. 系统开机自启：把启动命令做成快捷方式丢进启动目录（Windows：`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`）
3. 手动：任何把服务跑在 `127.0.0.1:<port>` 的方式都行，包括 `node mock/server.mjs`

## 自检

```bash
node mock/server.mjs &          # 或者你已经有一个跑在 8848 的服务
node tools/check_panel.mjs --api http://127.0.0.1:8848
```

退出码 0 = 全过。它不依赖浏览器：自带的迷你 React 会真跑 `client.js` 的组件树，真打 HTTP，断言文字树而不是快照。

真实输出（本机 Node 22）：

```text
  [OK]   模块声明了 id  dsh-plugin-yu-comments
  [OK]   侧边栏只有一个图标（没另起插件）  yu-comments
  [OK]   主区只有一个面板 key  yu-comments
  [OK]   默认停在评论记录视图
  [OK]   切到个人中心 / 五个分页都在 / 设置有 13 个输入控件
  [OK]   设置里没有密钥
  [OK]   默认是列表视图  行数 22
  [OK]   能切到缩略图视图  图数 50
  [OK]   能切回大图视图  卡数 22
  [OK]   渲染全程没抛异常

37/37 通过
```

CI（GitHub Actions）跑同样的三件事：`node --check` 语法检查 → 起 mock → 37 条自检。

## 权限与隐私

- 插件只请求 `127.0.0.1`（默认 8848），没有遥测、没有外部上报、没有第三方脚本
- 服务端返回什么就显示什么；仓库里的 mock 全是合成数据
- 面板不显示、也不请求任何 cookie / token / API key；自检里有一条专门断言页面文本不含 `sk-` 和 `SESSDATA`
- Host 半边会 `spawn` 本地服务进程：只有在你**配置了** `projectDir` 且该目录存在 `web.py` 时才会发生；`supervise: false` 可完全关闭，插件释放时会结束自己拉起的子进程
- 如果你接的是自己的机器人服务，凭证请放在服务端配置里，别塞进前端

## 兼容与运行要求

- DSH 桌面版（client 半边 `platform: web`，Host 半边需要 `ctx.effect` / `ctx.slots` / `ctx.get('locale')`）
- Node.js ≥ 18（mock 与自检脚本；浏览器端由 DSH 自带运行时加载）
- 浏览器：Chromium / Edge / Safari 近两年版本（用到 `color-mix()`，旧浏览器只是配色退化）
- 与 DeepSeek AI 无隶属关系，非官方插件

## License

[MIT](LICENSE)
