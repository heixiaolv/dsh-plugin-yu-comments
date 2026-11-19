/**
 * 零依赖本地 mock 服务：给面板一份「真的有数据」的假后端。
 *
 * 用途：
 *   - 装上插件后想先看看面板长什么样，不用接自己的业务服务；
 *   - `npm run check` 跑面板自检时当作接口（tools/check_panel.mjs 会真发 HTTP）。
 *
 * 用法：
 *   node mock/server.mjs            # 默认 8848
 *   node mock/server.mjs --port 9000
 *
 * 它实现了 docs/API.md 里列出的全部端点：/api/state、/api/records、
 * /api/me、/api/me/settings、/api/workers、/api/clock、/covers/<file>。
 * 数据全部是合成示例，不含任何真实账号、评论或个人信息。
 */
import { createServer } from 'node:http';

const argPort = process.argv.indexOf('--port');
const PORT = Number(argPort > 0 ? process.argv[argPort + 1] : process.env.PORT || 8848);
const STARTED = Date.now();

/* ------------------------------------------------ 合成数据 */

let seed = 20260101;
function rnd() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
const pick = (list) => list[Math.floor(rnd() * list.length)];

const TITLES = [
  '示例视频：把一条长评论写短到底有多难',
  '示例视频：评论区观察日记 第 3 期',
  '示例视频：用脚本整理自己的时间线',
  '示例视频：开源项目第一次发布的样子',
  '示例视频：侧边栏插件从 0 到 1',
  '示例视频：把日记写成一本书',
  '示例视频：为什么你的自动化总在半夜跑',
  '示例视频：一份数据面板的排版练习',
];
const AUTHORS = ['示例UP主·甲', '示例UP主·乙', '示例UP主·丙', '示例UP主·丁'];
const MESSAGES = [
  '这条是示例评论，用来验证面板能正确显示多行文本。\n——示例署名',
  '缩略图、标题、时间、正文都到位了，剩下的就是真实数据。',
  '第一行是正文。\n第二行用来测换行。\n——示例署名',
  '列表视图里这条会被截断成 40 个字，展开能看到全文。',
  '点赞数不重要，示例数据里没有真实互动。',
];

function dayStart(offsetDays) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - offsetDays);
  return Math.floor(d.getTime() / 1000);
}
const pad = (n) => (n < 10 ? '0' + n : String(n));
function dayOf(ts) {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const RECORDS = [];
for (let day = 0; day < 6; day += 1) {
  const base = dayStart(day);
  const count = 2 + Math.floor(rnd() * 4);
  for (let i = 0; i < count; i += 1) {
    const index = RECORDS.length + 1;
    const bvid = 'BV1DEMO' + String(index).padStart(5, '0');
    RECORDS.push({
      bvid,
      rpid: 1000000000 + index * 977,
      title: pick(TITLES) + ' #' + index,
      author: pick(AUTHORS),
      message: pick(MESSAGES),
      cover: 'covers/' + bvid + '.svg',
      slot: pick(['早', '午', '晚', '夜']),
      ts: base + 9 * 3600 + Math.floor(rnd() * 12 * 3600),
    });
  }
}
RECORDS.sort((a, b) => b.ts - a.ts);

const SETTINGS = {
  model: {
    model: 'demo-model',
    temperature: 0.7,
    offset_rate: 0.1,
    comment_max_len: 180,
    reply_max_len: 80,
  },
  behaviour: {
    dry_run: true,
    daily_max: 20,
    per_hour: 3,
    min_play: 1000,
    max_play: 200000,
    max_per_author: 2,
  },
  lists: {
    keywords: ['示例关键词一', '示例关键词二', '示例关键词三'],
    block_words: ['示例屏蔽词'],
  },
};

const STATE = {
  clock: { skip: false, line: '今天按正常节奏干活', skip_reason: '' },
  settings: JSON.parse(JSON.stringify(SETTINGS)),
  workers: {
    service: { title: '记录服务', state: '在干活', beat_age: 4, pid: 1001 },
    surf: { title: '冲浪', state: '在干活', beat_age: 37, pid: 1002 },
    replies: { title: '回复', state: '在干活', beat_age: 12, pid: 1003 },
  },
};

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function recordsPayload(query) {
  const limit = Math.min(500, Math.max(1, Number(query.get('limit') || 200)));
  const day = (query.get('day') || '').trim();
  const q = (query.get('q') || '').trim().toLowerCase();
  const offset = Math.max(0, Number(query.get('offset') || 0));

  const filtered = RECORDS.filter((row) => {
    if (day && dayOf(row.ts) !== day) return false;
    if (!q) return true;
    return [row.title, row.author, row.message].join(' ').toLowerCase().indexOf(q) >= 0;
  });
  const days = [];
  const counter = new Map();
  RECORDS.forEach((row) => {
    const key = dayOf(row.ts);
    counter.set(key, (counter.get(key) || 0) + 1);
  });
  Array.from(counter.keys())
    .sort()
    .reverse()
    .forEach((key) => days.push({ day: key, count: counter.get(key) }));

  return {
    ok: true,
    records: copy(filtered.slice(offset, offset + limit)),
    days,
    total: filtered.length,
    stats: {
      total: RECORDS.length,
      today: counter.get(dayOf(Math.floor(Date.now() / 1000))) || 0,
      with_cover: RECORDS.filter((row) => row.cover).length,
    },
  };
}

function mePayload() {
  const hourly = Array.from({ length: 24 }, (_, hour) => {
    if (hour < 8 || hour > 23) return 0;
    return Math.max(0, Math.round(Math.sin((hour - 8) / 4) * 3));
  });
  const today = dayStart(0);
  const todayCount = RECORDS.filter((row) => row.ts >= today).length;

  return {
    ok: true,
    account: {
      uname: 'demo_fish',
      mid: 10001,
      level: 6,
      fans: 128,
      logged_in: true,
      avatar: null,
    },
    health: {
      today: todayCount,
      total_comments: RECORDS.length,
      last_comment: new Date(RECORDS[0].ts * 1000).toISOString().slice(0, 16).replace('T', ' '),
      hourly,
      chain: { ok: true, links: 4, charter: 'demo-chain', broken: '' },
      locks: [{ name: 'surf', alive: true, pid: 1002 }],
    },
    memory: {
      stats: { total: 12, hot: 5, long_term: 3, superseded: 1 },
      by_kind: { insight: 4, correction: 2, preference: 3, world: 2, note: 1 },
      projection: '这一轮开工时会带上：示例人设锚点、最近 5 条在场记忆、权重表。',
      rows: [
        { id: 1, kind: 'insight', gist: '示例记忆：短评论更容易被读完。', why: '示例原因', ts: dayStart(1), long_term: true },
        { id: 2, kind: 'preference', gist: '示例记忆：不在深夜发评论。', why: '示例原因', ts: dayStart(2), long_term: false },
        { id: 3, kind: 'correction', gist: '示例记忆：别把模板句直接复制。', why: '示例原因', ts: dayStart(3), long_term: false },
      ],
    },
    feedback: {
      ok: true,
      n: RECORDS.length,
      overall_avg: 3.2,
      silent_ratio: 0.23,
      angles: [
        { angle: '幽默', n: 12, avg_like: 4.1, max_like: 19, zero: 2, ratio: 1.3, enough: true },
        { angle: '共情', n: 6, avg_like: 2.8, max_like: 9, zero: 2, ratio: 0.9, enough: false },
        { angle: '补充信息', n: 8, avg_like: 3.4, max_like: 12, zero: 1, ratio: 1.1, enough: true },
      ],
      weights: { 幽默: 1.3, 共情: 0.9, 补充信息: 1.1 },
      weights_notes: { 幽默: '样本 12 条', 共情: '样本不足，没动' },
      weights_at: '2026-01-01 00:00',
    },
    persona: {
      capabilities_done: ['能读记录|从本地服务取数', '能写短评|限制长度'],
      capabilities_todo: ['能看复盘|需要真实点赞数据', '能算权重|需要足够样本'],
      files: [
        { name: 'persona/anchor.md', role: '我是谁', size: 1024 },
        { name: 'persona/identity.md', role: '说话习惯', size: 768 },
      ],
      anchor_sections: [{ title: '示例锚点', body: '这段文字来自 mock，用来演示人设分页的展示效果。' }],
      identity_sections: [{ title: '示例习惯', body: '句子短、不客套、不用总结腔。' }],
    },
    runtime: { dry_run: true },
    brake: { ok: true, tripped: false, cooling: 0, window_h: 24, strikes_recent: 0, limit: 3 },
    clock: copy(STATE.clock),
    share: { ready: true, daily_max: 3 },
    diary: [
      {
        day: dayOf(dayStart(1)),
        yg: '# 示例日记\n对外那本：今天写了 N 条评论，没人理也算数据。',
        self: '# 示例日记\n给自己那本：有点累，明天少写两条。',
      },
    ],
    settings: copy(STATE.settings),
  };
}

/* ------------------------------------------------ SVG 封面 */

function coverSvg(name) {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) % 360;
  const bg = `hsl(${h} 60% 22%)`;
  const fg = `hsl(${(h + 40) % 360} 80% 78%)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
  <rect width="320" height="180" fill="${bg}"/>
  <circle cx="268" cy="36" r="52" fill="${fg}" fill-opacity=".18"/>
  <text x="20" y="100" fill="${fg}" font-family="system-ui, sans-serif" font-size="18">demo cover</text>
  <text x="20" y="126" fill="${fg}" fill-opacity=".75" font-family="ui-monospace, monospace" font-size="12">${name.replace(/[<>&]/g, '')}</text>
</svg>`;
}

/* ------------------------------------------------ HTTP */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
};

function sendJson(res, payload, status = 200) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8');
  res.writeHead(status, {
    ...CORS,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8');
      if (!text) return resolve({});
      try {
        return resolve(JSON.parse(text));
      } catch {
        return resolve({});
      }
    });
  });
}

function diffSettings(next) {
  const changed = [];
  ['model', 'behaviour', 'lists'].forEach((section) => {
    if (!next || typeof next[section] !== 'object') return;
    if (JSON.stringify(next[section]) === JSON.stringify(STATE.settings[section])) return;
    changed.push(section);
    STATE.settings[section] = { ...STATE.settings[section], ...next[section] };
  });
  return changed;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const path = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    if (path === '/api/state') {
      return sendJson(res, {
        ok: true,
        service: 'yu-comments-mock',
        pid: process.pid,
        uptime: Math.round((Date.now() - STARTED) / 1000),
        records: RECORDS.length,
      });
    }
    if (path === '/api/records') return sendJson(res, recordsPayload(url.searchParams));
    if (path === '/api/me') return sendJson(res, mePayload());
    if (path === '/api/workers') {
      return sendJson(res, {
        ok: true,
        ...copy(STATE.workers),
        watchdog: { last_check: Math.floor(Date.now() / 1000), age: 40, checks: 12, max_per_hour: 6 },
      });
    }
    if (path === '/api/clock') return sendJson(res, { ok: true, ...copy(STATE.clock) });
    if (path.startsWith('/covers/')) {
      const name = decodeURIComponent(path.slice('/covers/'.length));
      const body = Buffer.from(coverSvg(name), 'utf8');
      res.writeHead(200, {
        ...CORS,
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Content-Length': body.length,
      });
      res.end(body);
      return;
    }
    return sendJson(res, { ok: false, error: 'not found: ' + path }, 404);
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    if (path === '/api/me/settings') {
      const changed = diffSettings(body);
      return sendJson(res, {
        ok: true,
        count: changed.length,
        changed,
        config: copy(STATE.settings),
      });
    }
    if (path === '/api/workers') {
      const target = String(body.target || '');
      if (!STATE.workers[target]) {
        return sendJson(res, { ok: false, msg: '未知目标：' + target }, 400);
      }
      STATE.workers[target].beat_age = 1;
      STATE.workers[target].state = body.action === 'stop' ? '停' : '在干活';
      return sendJson(res, { ok: true, msg: 'mock：' + target + ' 已' + (body.action === 'stop' ? '停' : '重启') });
    }
    if (path === '/api/clock') {
      STATE.clock = body.action === 'wake'
        ? { skip: false, line: '今天按正常节奏干活', skip_reason: '' }
        : { skip: true, line: '', skip_reason: 'mock：手动休息' };
      return sendJson(res, { ok: true, ...copy(STATE.clock), note: 'mock 已更新生物钟' });
    }
    return sendJson(res, { ok: false, error: 'not found: ' + path }, 404);
  }

  return sendJson(res, { ok: false, error: 'method not allowed' }, 405);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[yu-comments-mock] http://127.0.0.1:${PORT}  (records: ${RECORDS.length})`);
  console.log('[yu-comments-mock] Ctrl+C 结束');
});
