/**
 * 面板自检：不起浏览器，直接把 client.js 真跑一遍。
 *
 * 为什么要有这个文件：插件面板是 React 组件，而这边开不了 Chromium（守护进程被
 * Job Object 挡住起不来），所以用「迷你 React + 真接口」把整棵组件树真渲染出来，
 * 断言文字树：一个侧边栏图标、两个视图（评论记录 / 个人中心）、五个分页能切、
 * 设置能提交、页面里不出现密钥。
 *
 * 用法：node tools/check_panel.mjs [--api http://127.0.0.1:8848]
 * 退出码 0 表示全过。
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PLUGIN = resolve(HERE, '..', 'client.js');
const argApi = process.argv.indexOf('--api');
const API = argApi > 0 ? process.argv[argApi + 1] : 'http://127.0.0.1:8848';

let passed = 0;
let failed = 0;
const line = (name, cond, extra) => {
  if (cond) {
    passed += 1;
    console.log('  [OK]   ' + name + (extra ? '  ' + extra : ''));
  } else {
    failed += 1;
    console.log('  [FAIL] ' + name + (extra ? '  ' + extra : ''));
  }
};

/* ------------------------------------------- 迷你 React（按组件分桶存 hooks） */
const buckets = new Map();
const ranEffects = new Set();
const cleanups = [];
let owner = null;
let bucketSeq = 0;
let dirty = false;

const flatten = (children) =>
  children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false && c !== true);

function bucketOf(component) {
  let bucket = buckets.get(component);
  if (!bucket) {
    bucket = { id: (bucketSeq += 1), states: [], effects: [], cursor: 0 };
    buckets.set(component, bucket);
  }
  return bucket;
}

const React = {
  createElement(type, props, ...children) {
    return { type, props: props || {}, children: flatten(children) };
  },
  useState(init) {
    const bucket = bucketOf(owner);
    const slot = bucket.cursor++;
    if (!(slot in bucket.states)) bucket.states[slot] = typeof init === 'function' ? init() : init;
    const set = (value) => {
      const next = typeof value === 'function' ? value(bucket.states[slot]) : value;
      if (next !== bucket.states[slot]) {
        bucket.states[slot] = next;
        dirty = true;
      }
    };
    return [bucket.states[slot], set];
  },
  useEffect(fn) {
    bucketOf(owner).effects.push(fn);
  },
  useLayoutEffect(fn) {
    bucketOf(owner).effects.push(fn);
  },
  useCallback(fn) {
    return fn;
  },
  useMemo(fn) {
    return fn();
  },
  useRef(init) {
    return { current: init };
  },
};

/* ------------------------------------------- 浏览器桩 */
const timers = new Set();
globalThis.window = {
  __ModuleLoader__: { load(mod) { captured = mod; } },
  // --api 也决定插件自己往哪打，别让它写死 8848 打到真实服务
  __YU_COMMENTS_API__: API,
  setInterval: (fn, ms) => {
    const id = setInterval(fn, ms);
    timers.add(id);
    return id;
  },
  clearInterval: (id) => {
    timers.delete(id);
    clearInterval(id);
  },
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
};
if (typeof globalThis.navigator === 'undefined') globalThis.navigator = { language: 'zh-CN' };

var captured = null;
const netCalls = [];
const nativeFetch = globalThis.fetch;
// 服务重启瞬间接口会短暂不通：重试两次，别把「服务在重启」误判成「面板坏了」
async function fetchRetry(full, options) {
  for (let i = 0; i < 3; i += 1) {
    try {
      const res = await nativeFetch(full, options);
      if (res && res.ok) return res;
    } catch (err) {
      if (i === 2) throw err;
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  return nativeFetch(full, options);
}

globalThis.fetch = (url, options) => {
  const full = String(url).startsWith('http') ? String(url) : API + String(url);
  netCalls.push(full);
  return fetchRetry(full, options);
};

const allow = (name) => {
  if (name === 'react') return React;
  throw new Error('插件要求了未预期的依赖：' + name);
};
new Function('window', 'require', readFileSync(PLUGIN, 'utf8'))(globalThis.window, allow);

line('模块声明了 id', !!captured && captured.id === 'dsh-plugin-yu-comments', captured && captured.id);
const mod = captured.factory(allow);
line('工厂返回 apply', typeof mod.apply === 'function');

/* ------------------------------------------- 注册 */
const regs = [];
const ctx = {
  get: () => null,
  logger: () => {},
  effect: (fn) => {
    const cleanup = fn();
    if (typeof cleanup === 'function') cleanups.push(cleanup);
  },
  slots: {
    inject: (name, factory) => {
      regs.push({ name, result: factory() });
    },
    register: (meta, component) => ({ meta, component }),
  },
};
mod.apply(ctx);

const sidebar = regs.filter((r) => r.name === 'sidebar.panellist').map((r) => r.result.meta);
const mains = regs.filter((r) => r.name === 'main').map((r) => r.result.meta);
line('侧边栏只有一个图标（没另起插件）', sidebar.length === 1, sidebar.map((m) => m.id).join(', '));
line('主区只有一个面板 key', mains.length === 1, mains.map((m) => m.key).join(', '));
line('面板 key 仍是 yu-comments', !!mains[0] && mains[0].key === 'yu-comments');

const Shell = regs.filter((r) => r.name === 'main')[0].result.component;
line('面板组件是外壳（两个视图）', typeof Shell === 'function' && Shell.name === 'Shell', Shell && Shell.name);

/* ------------------------------------------- 递归渲染 */
function renderNode(node) {
  if (node === null || node === undefined || node === false || node === true) return node;
  if (Array.isArray(node)) return flatten(node.map(renderNode));
  if (typeof node === 'string' || typeof node === 'number') return node;

  if (typeof node.type === 'function') {
    const previous = owner;
    owner = node.type;
    const bucket = bucketOf(node.type);
    const saved = bucket.cursor;
    bucket.cursor = 0;
    let output;
    try {
      output = node.type(node.props || {});
    } finally {
      bucket.cursor = saved;
      owner = previous;
    }
    return renderNode(output);
  }

  return {
    type: node.type,
    props: Object.assign({}, node.props),
    children: flatten(node.children.map(renderNode)),
  };
}

async function pass() {
  dirty = false;
  buckets.forEach((bucket) => {
    bucket.effects = [];
  });
  const tree = renderNode({ type: Shell, props: {}, children: [] });
  // 每个组件的第 N 个 effect 只跑一次：新视图第一次出现时就跑
  buckets.forEach((bucket) => {
    bucket.effects.forEach((fn, index) => {
      const key = bucket.id + ':' + index;
      if (ranEffects.has(key)) return;
      ranEffects.add(key);
      const cleanup = fn();
      if (typeof cleanup === 'function') cleanups.push(cleanup);
    });
  });
  await new Promise((r) => setTimeout(r, 80));
  return tree;
}

async function settle(rounds = 10) {
  let tree = null;
  for (let round = 0; round < rounds; round += 1) {
    tree = await pass();
    if (!dirty) break;
  }
  return tree;
}

/* ------------------------------------------- 树工具 */
function walk(node, visit) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((child) => walk(child, visit));
    return;
  }
  if (typeof node === 'string' || typeof node === 'number') return;
  visit(node);
  node.children.forEach((child) => walk(child, visit));
}

function visibleText(tree) {
  const bits = [];
  walk(tree, (node) => {
    if (node.type === 'style') return;
    node.children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') bits.push(String(child));
    });
  });
  return bits.join(' ');
}

function nodeText(node) {
  const bits = [];
  const visit = (current) => {
    if (!current) return;
    if (Array.isArray(current)) {
      current.forEach(visit);
      return;
    }
    if (typeof current === 'string' || typeof current === 'number') {
      bits.push(String(current));
      return;
    }
    if (current.type === 'style') return;
    current.children.forEach(visit);
  };
  visit(node);
  return bits.join('');
}

function findClickable(tree, text) {
  let found = null;
  walk(tree, (node) => {
    if (found || typeof node.props.onClick !== 'function') return;
    if (nodeText(node).indexOf(text) >= 0) found = node;
  });
  return found;
}

function countBy(tree, test) {
  let n = 0;
  walk(tree, (node) => {
    if (test(node)) n += 1;
  });
  return n;
}

function findForm(tree) {
  let found = null;
  walk(tree, (node) => {
    if (!found && node.type === 'form' && typeof node.props.onSubmit === 'function') found = node;
  });
  return found;
}

const click = async (tree, label) => {
  const target = findClickable(tree, label);
  if (!target) return { tree, text: '', ok: false };
  target.props.onClick({ preventDefault() {} });
  const next = await settle();
  return { tree: next, text: visibleText(next), ok: true };
};

/* ------------------------------------------- 断言 */
let tree = await settle();
let text = visibleText(tree);
line('默认停在评论记录视图', text.indexOf('小鱼评论记录') >= 0, text.slice(0, 30));
line('外壳有两个视图按钮', text.indexOf('评论记录') >= 0 && text.indexOf('个人中心') >= 0);
line('记录接口被真调用', netCalls.some((u) => u.indexOf('/api/records') >= 0), netCalls[0]);

const inputs = () => countBy(tree, (n) => ['input', 'textarea', 'select'].indexOf(n.type) >= 0);

let step = await click(tree, '个人中心');
tree = step.tree;
text = step.text;
line('切到个人中心', step.ok && text.indexOf('个人中心') >= 0);
line('五个分页都在', ['概览', '人设', '记忆', '复盘', '设置'].every((k) => text.indexOf(k) >= 0));
line('个人中心接口被真调用', netCalls.some((u) => u.indexOf('/api/me') >= 0));
line('渲染出账号信息', text.indexOf('mid') >= 0 && (text.indexOf('demo_fish') >= 0 || text.indexOf('Lv') >= 0));
line('概览有统计标签', text.indexOf('今日评论') >= 0 && text.indexOf('人格链') >= 0);
line('概览有 24 根柱', countBy(tree, (n) => String(n.props.className || '').indexOf('ym-bar') >= 0) === 24);
line('概览有闸门与生物钟', text.indexOf('闸门') >= 0 && text.indexOf('生物钟') >= 0);
line('概览有工人开关', text.indexOf('工人开关') >= 0 && text.indexOf('重启') >= 0);
line('工人开关有三行', ['冲浪', '回复', '记录服务'].every((x) => text.indexOf(x) >= 0));
line('概览有两本日记', text.indexOf('最近两本日记') >= 0 && text.indexOf('对外') >= 0);

step = await click(tree, '人设');
tree = step.tree;
text = step.text;
line('切到人设', text.indexOf('我是谁') >= 0);

step = await click(tree, '记忆');
tree = step.tree;
text = step.text;
line('切到记忆', text.indexOf('这一轮开工会读到的东西') >= 0);

step = await click(tree, '复盘');
tree = step.tree;
text = step.text;
line('切到复盘', text.indexOf('哪种角度真有人理') >= 0);

step = await click(tree, '设置');
tree = step.tree;
text = step.text;
line('切到设置', text.indexOf('保存设置') >= 0);
line('设置有输入控件', inputs() >= 8, '数量 ' + inputs());
line('设置里没有密钥', text.indexOf('sk-') < 0 && text.indexOf('SESSDATA') < 0);

const form = findForm(tree);
if (form) {
  form.props.onSubmit({ preventDefault() {} });
  await new Promise((r) => setTimeout(r, 1500));
  tree = await settle();
  text = visibleText(tree);
  line('保存走得通（没改动就如实说）', text.indexOf('没有改动') >= 0 || text.indexOf('改了') >= 0, text.slice(-50));
} else {
  line('找到设置表单', false);
}

step = await click(tree, '评论记录');
line('能切回评论记录', step.ok && step.text.indexOf('小鱼评论记录') >= 0);

// —— 视图切换：默认列表（封面不铺满），能切缩略图 / 大图
// 切回记录页会重新拉一次接口，等数据到了再看
await new Promise((r) => setTimeout(r, 1200));
tree = await settle();
text = visibleText(tree);

const cls = (n) => String(n.props.className || '');
const has = (needle) => countBy(tree, (n) => cls(n).indexOf(needle) >= 0);
const viewBtns = [];
walk(tree, (n) => {
  if (cls(n).indexOf('yc-view-btn') >= 0) viewBtns.push(n);
});
line('有视图切换按钮', viewBtns.length === 3, '数量 ' + viewBtns.length);
const exact = (name) => countBy(tree, (n) => cls(n) === name);
line('默认是列表视图', exact('yc-row') > 0, '行数 ' + exact('yc-row'));
line('列表行的小缩略图', has('yc-thumb-sm') > 0, '数量 ' + has('yc-thumb-sm'));
line('默认没有大封面铺开', has('yc-grid') === 0 && has('yc-card') === 0);

const firstRow = (() => {
  let found = null;
  walk(tree, (n) => {
    if (!found && cls(n) === 'yc-row') found = n;
  });
  return found;
})();
if (firstRow) {
  firstRow.props.onClick({ preventDefault() {} });
  tree = await settle();
  text = visibleText(tree);
}
line('点列表行能展开详情', has('yc-detail') > 0);
line('详情里有完整评论与链接',
  has('yc-detail') > 0 && text.indexOf('rpid') >= 0);

const thumbBtn = viewBtns.filter((n) => nodeText(n).indexOf('缩略') >= 0)[0];
if (thumbBtn) {
  thumbBtn.props.onClick({ preventDefault() {} });
  tree = await settle();
  text = visibleText(tree);
}
line('能切到缩略图视图', has('yc-thumb') > 0 && has('yc-thumbs') > 0, '图数 ' + has('yc-thumb'));

const cardBtn = viewBtns.filter((n) => nodeText(n).indexOf('大图') >= 0)[0];
if (cardBtn) {
  cardBtn.props.onClick({ preventDefault() {} });
  tree = await settle();
  text = visibleText(tree);
}
line('能切回大图视图', has('yc-card') > 0 && has('yc-grid') > 0, '卡数 ' + has('yc-card'));

const listBtn = viewBtns.filter((n) => nodeText(n).indexOf('列表') >= 0)[0];
if (listBtn) {
  listBtn.props.onClick({ preventDefault() {} });
  tree = await settle();
}
line('切回列表后仍正常', exact('yc-row') > 0);

line('渲染全程没抛异常', true);

/* ------------------------------------------- 收尾 */
cleanups.forEach((fn) => {
  try {
    fn();
  } catch (error) {
    /* 已释放 */
  }
});
timers.forEach((id) => clearInterval(id));

console.log('\n' + passed + '/' + (passed + failed) + ' 通过' + (failed ? '，失败项见上' : ''));
process.exit(failed ? 1 : 0);
