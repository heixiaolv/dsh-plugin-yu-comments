/**
 * Host half of the `dsh-plugin-yu-comments` bundle.
 *
 * 面板的数据来自一个本地 HTTP 记录服务（默认 http://127.0.0.1:8848）。
 * 这里只负责把它看住：
 *
 *   1. 插件激活时探测一次 `/api/state`；
 *   2. 连不上就按配置的目录 + 解释器拉起服务；
 *   3. 之后每 `intervalMs` 复查一次，掉了再拉；
 *   4. 插件释放时结束自己拉起来的子进程，不留孤儿。
 *
 * 所有路径都来自配置或环境变量，仓库里没有写死的机器路径：
 *   - 插件配置：cordis.patch.yml 里的 projectDir / python / port
 *   - 环境变量：YU_COMMENTS_DIR、YU_COMMENTS_PYTHON、YU_COMMENTS_PORT
 *
 * 想自己起服务（比如用仓库自带的 mock）时，把 supervise 关掉即可。
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_PORT = 8848;
const DEFAULT_ENTRY = 'web.py';

const DEFAULTS = {
  port: Number(process.env.YU_COMMENTS_PORT || DEFAULT_PORT),
  // 服务代码所在目录；留空 = 进程当前目录（npm run mock 时就是仓库根）
  projectDir: process.env.YU_COMMENTS_DIR || '',
  // 必须是带 w 的解释器：python.exe 会给自己开一个控制台窗口，用户看到的就是黑框一闪
  python: process.env.YU_COMMENTS_PYTHON || (process.platform === 'win32' ? 'pythonw' : 'python'),
  entry: DEFAULT_ENTRY,
  supervise: true,
  intervalMs: 30000,
};

/** 探测服务是否活着；连不上返回 false，交给调用方决定是否拉起。 */
async function probe(base) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(base + '/api/state', {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return response.ok;
  } catch {
    return false;
  }
}

export function apply(ctx, config = {}) {
  const cfg = { ...DEFAULTS, ...(config || {}) };
  const port = Number(cfg.port) || DEFAULT_PORT;
  const base = `http://127.0.0.1:${port}`;
  const projectDir = cfg.projectDir ? path.resolve(String(cfg.projectDir)) : process.cwd();
  const log = (message) => {
    try {
      if (ctx.logger) ctx.logger('yu-comments: ' + message);
      else console.log('[yu-comments] ' + message);
    } catch {
      /* 日志不可用时静默 */
    }
  };

  if (typeof fetch !== 'function') {
    log('当前运行时没有 fetch，跳过自动拉起');
    return;
  }

  let child = null;
  let timer = null;
  let stopped = false;
  let lastSpawnAt = 0;
  let spawnFailures = 0;

  function spawnService() {
    const script = path.join(projectDir, String(cfg.entry || DEFAULT_ENTRY));
    if (!existsSync(script)) {
      log('找不到 ' + script + '，无法自动启动服务（改 projectDir/entry，或关掉 supervise）');
      return false;
    }
    const python = existsSync(String(cfg.python)) ? String(cfg.python) : 'pythonw';
    if (Date.now() - lastSpawnAt < 5000) return false;
    lastSpawnAt = Date.now();
    try {
      child = spawn(python, [script, '--port', String(port)], {
        cwd: projectDir,
        windowsHide: true,
        stdio: 'ignore',
        env: process.env,
        detached: false,
      });
      child.on('error', (error) => {
        log('启动失败：' + (error && error.message ? error.message : String(error)));
        child = null;
        spawnFailures += 1;
      });
      child.on('exit', (code) => {
        if (!stopped) log('记录服务退出，code=' + code);
        child = null;
      });
      spawnFailures = 0;
      log('已拉起记录服务 ' + base);
      return true;
    } catch (error) {
      log('启动异常：' + (error && error.message ? error.message : String(error)));
      return false;
    }
  }

  async function tick(first) {
    if (stopped) return;
    if (await probe(base)) {
      spawnFailures = 0;
      return;
    }
    if (!cfg.supervise) return;
    // 连续失败多次就放慢节奏，避免反复 fork
    if (spawnFailures >= 3 && !first) return;
    spawnService();
  }

  ctx.effect(() => {
    tick(true);
    timer = setInterval(
      () => {
        tick(false);
      },
      Math.max(5000, Number(cfg.intervalMs) || DEFAULTS.intervalMs),
    );
    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
      timer = null;
      if (child) {
        try {
          child.kill();
        } catch {
          /* 已退出 */
        }
        child = null;
      }
    };
  });
}
