# 本地记录服务 API

面板不直接读数据库，也不碰任何 B 站接口：它只跟一个跑在 `127.0.0.1` 的 HTTP 服务说话。
按本文实现这几个端点，就能把面板接到你自己的存档上；仓库里的 `mock/server.mjs` 是一份可直接运行的参考实现。

## 约定

- 传输：HTTP/1.1，JSON，UTF-8
- 监听：`127.0.0.1:<port>`，默认 `8848`
- CORS：至少带 `Access-Control-Allow-Origin: *`，否则 DSH 页面跨端口取不到数据
- 时间戳：`ts` 一律是 **Unix 秒**
- 失败响应：HTTP 4xx/5xx 或 `{ "ok": false, "error": "..." }`

面板侧地址可覆盖，不用改源码：

```js
window.__YU_COMMENTS_API__ = 'http://127.0.0.1:9000';
// 或
localStorage.setItem('yu-comments.api', 'http://127.0.0.1:9000');
```

## GET /api/state

存活探测。插件 Host 半边每次 relaunch 前都先打这个。

```json
{ "ok": true, "pid": 12345, "uptime": 3600 }
```

只有 HTTP 200 才算活着，正文内容面板不看。

## GET /api/records

评论存档列表。

查询参数：

| 参数 | 说明 |
|---|---|
| `limit` | 返回条数上限，面板固定传 200 |
| `day` | `YYYY-MM-DD`，按天过滤；空 = 全部 |
| `q` | 关键词，匹配标题 / UP 主 / 正文；空 = 不过滤 |
| `offset` | 偏移，默认 0 |

响应：

```json
{
  "ok": true,
  "records": [
    {
      "bvid": "BV1xx411c7mD",
      "rpid": 1234567890,
      "title": "视频标题",
      "author": "UP 主昵称",
      "message": "评论正文，允许换行\n——署名",
      "cover": "covers/BV1xx411c7mD.jpg",
      "slot": "早",
      "ts": 1763500000
    }
  ],
  "days": [{ "day": "2026-11-19", "count": 6 }],
  "stats": { "total": 128, "today": 6, "with_cover": 120 }
}
```

- `cover` 是**相对路径**，面板拼成 `API + '/' + cover` 去取；留空则显示占位图标
- `days` 用于日期下拉，按天倒序
- `stats.total` / `stats.with_cover` 是全局数字，不受 `day` / `q` 影响

## GET /covers/<file>

封面图，直接返回图片字节（`image/jpeg`、`image/png`、`image/svg+xml` 都行）。
路径就是 `records[].cover` 的值，注意不要带前导斜杠。

## GET /api/me

个人中心一次性拿到的聚合数据。字段都可缺省，面板对缺省值做了兜底。

```json
{
  "ok": true,
  "account": {
    "uname": "昵称", "mid": 10001, "level": 6, "fans": 128,
    "logged_in": true, "avatar": null
  },
  "health": {
    "today": 4, "total_comments": 26, "last_comment": "2026-11-19 09:12",
    "hourly": [0, 0, 1, 2, 0, 0, 3, 5, 2, 0, 0, 0, 1, 1, 0, 0, 2, 3, 4, 2, 1, 1, 0, 0],
    "chain": { "ok": true, "links": 4, "charter": "demo", "broken": "" },
    "locks": [{ "name": "surf", "alive": true, "pid": 1002 }]
  },
  "memory": {
    "stats": { "total": 12, "hot": 5, "long_term": 3, "superseded": 1 },
    "by_kind": { "insight": 4, "correction": 2, "preference": 3, "world": 2, "note": 1 },
    "projection": "这一轮开工时会带上的上下文摘要",
    "rows": [
      { "id": 1, "kind": "insight", "gist": "一句话记忆", "why": "为什么记", "ts": 1763400000, "long_term": true }
    ]
  },
  "feedback": {
    "ok": true, "n": 26, "overall_avg": 3.2, "silent_ratio": 0.23,
    "angles": [
      { "angle": "幽默", "n": 12, "avg_like": 4.1, "max_like": 19, "zero": 2, "ratio": 1.3, "enough": true }
    ],
    "weights": { "幽默": 1.3 },
    "weights_notes": { "幽默": "样本 12 条" },
    "weights_at": "2026-11-18 12:00"
  },
  "persona": {
    "capabilities_done": ["能力名|说明"],
    "capabilities_todo": ["还没做的能力|说明"],
    "files": [{ "name": "persona/anchor.md", "role": "我是谁", "size": 1024 }],
    "anchor_sections": [{ "title": "标题", "body": "正文" }],
    "identity_sections": [{ "title": "标题", "body": "正文" }]
  },
  "runtime": { "dry_run": true },
  "brake": { "ok": true, "tripped": false, "tripped_reason": "", "cooling": 0, "window_h": 24, "strikes_recent": 0, "limit": 3 },
  "clock": { "skip": false, "line": "今天按正常节奏干活", "skip_reason": "" },
  "share": { "ready": true, "daily_max": 3 },
  "diary": [{ "day": "2026-11-19", "yg": "对外那本", "self": "给自己那本" }],
  "settings": { "model": {}, "behaviour": {}, "lists": {} }
}
```

`hourly` 固定 24 个数，概览页会画成 24 根柱子。`settings` 的结构见下一节。

## POST /api/me/settings

保存设置。请求体是白名单里的三个分节，服务端只写有变化的键。

```json
{
  "model": { "model": "demo-model", "temperature": 0.7, "offset_rate": 0.1, "comment_max_len": 180, "reply_max_len": 80 },
  "behaviour": { "dry_run": true, "daily_max": 20, "per_hour": 3, "min_play": 1000, "max_play": 200000, "max_per_author": 2 },
  "lists": { "keywords": ["关键词"], "block_words": ["屏蔽词"] }
}
```

响应 `count` 是改动项数，`changed` 是改动的分节名，`config` 用来把表单刷成服务端的真实值：

```json
{ "ok": true, "count": 1, "changed": ["behaviour"], "config": { "model": {}, "behaviour": {}, "lists": {} } }
```

`count === 0` 时面板显示「没有改动，配置一致」。

## GET /api/workers · POST /api/workers

后台工人的进程 / 心跳状态。面板顶部有异常横幅，个人中心有「工人开关」。

`GET` 响应：

```json
{
  "ok": true,
  "service": { "title": "记录服务", "state": "在干活", "beat_age": 4, "pid": 1001 },
  "surf": { "title": "冲浪", "state": "在干活", "beat_age": 37, "pid": 1002 },
  "replies": { "title": "回复", "state": "在干活", "beat_age": 12, "pid": 1003 },
  "watchdog": { "last_check": 1763500000, "age": 40, "checks": 12, "max_per_hour": 6 }
}
```

- `state`：`在干活` / `卡住` / `停`（其它值按异常处理）
- `beat_age`：距上次心跳的秒数，`null` 表示没心跳

`POST` 请求体：`{ "action": "start" | "stop" | "restart", "target": "surf" }`，
响应：`{ "ok": true, "msg": "做完了" }`。

## GET /api/clock · POST /api/clock

生物钟：今天要不要干活。

`GET` → `{ "ok": true, "skip": false, "line": "今天按正常节奏干活", "skip_reason": "" }`

`POST` 请求体 `{ "action": "wake" | "sleep" }`，响应同上，可带 `note`。

## 最小可用实现

只要 `GET /api/state`、`GET /api/records`、`GET /covers/*` 三个，评论记录页就能完整跑起来；
个人中心那半（`/api/me` 等）没有也能用，页面会显示离线提示。
