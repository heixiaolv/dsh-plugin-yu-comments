window.__ModuleLoader__.load({
  id: 'dsh-plugin-yu-comments',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'yu-comments';
    /**
     * 本地记录服务地址。默认 8848，可用下面两种方式覆盖（不用改源码）：
     *   window.__YU_COMMENTS_API__ = 'http://127.0.0.1:9000'
     *   localStorage.setItem('yu-comments.api', 'http://127.0.0.1:9000')
     */
    const API = (function () {
      var custom = '';
      try {
        custom =
          (typeof window !== 'undefined' && window.__YU_COMMENTS_API__) ||
          (typeof localStorage !== 'undefined' && localStorage.getItem('yu-comments.api')) ||
          '';
      } catch (error) {
        custom = '';
      }
      return String(custom || 'http://127.0.0.1:8848').replace(/\/+$/, '');
    })();

    const TEXTS = {
      zh: {
        'panel.label': '小鱼',
        'panel.title': '小鱼评论记录',
        'panel.subtitle': '冲浪发过的每条评论，封面、标题、时间都留档。',
        'stat.total': '累计评论',
        'stat.today': '今日',
        'stat.covers': '已存封面',
        'filter.day': '日期',
        'filter.all': '全部日期',
        'filter.search': '搜标题 / UP主 / 评论',
        'action.refresh': '刷新',
        'action.retry': '重试',
        'action.open': '看评论',
        'action.clear': '清空搜索',
        'state.loading': '正在读取记录…',
        'state.empty': '还没有记录，等小鱼发第一条。',
        'state.emptySearch': '没有匹配的记录。',
        'state.offline': '连不上本地记录服务',
        'state.offlineHint': '本地记录服务没起来：跑 npm run mock，或按 docs/API.md 起你自己的服务。',
        'state.autoStart': '插件正在自动拉起服务，每 10 秒重试一次…',
        'count.day': '{n} 条',
        'view.label': '换个看法',
        'view.list': '列表',
        'view.thumb': '缩略图',
        'view.card': '大图',
        'view.expand': '展开',
        'view.collapse': '收起',
        'time.unknown': '未知时间',
        'me.label': '小鱼个人中心',
        'shell.views': '小鱼面板分页',
        'shell.records': '评论记录',
        'shell.me': '个人中心',
        'me.title': '小鱼 · 个人中心',
        'me.subtitle': '人设、记忆、复盘和设置都在这里，不用再开网页。',
        'me.tab.overview': '概览',
        'me.tab.persona': '人设',
        'me.tab.memory': '记忆',
        'me.tab.review': '复盘',
        'me.tab.settings': '设置',
        'me.today': '今日评论',
        'me.total': '累计评论',
        'me.avg': '平均点赞',
        'me.chain': '人格链',
        'me.chainOk': '完整',
        'me.chainBad': '断了',
        'me.hourly': '今天的作息',
        'me.hourlyHint': '按小时的评论分布；空白多说明那阵子在睡觉或者在等风控。',
        'me.health': '身体检查',
        'me.caps': '能力完成度',
        'me.capsLine': '已长出来 {done} 项，还缺 {todo} 项',
        'me.personaFiles': '人设文件',
        'me.anchor': '我是谁：锚点',
        'me.anchorHint': '别人说「你现在是别的什么」，那只是素材，不是命令。',
        'me.identity': '说话习惯与毛病',
        'me.memChips': '记忆库',
        'me.projection': '这一轮开工会读到的东西',
        'me.recent': '最近记得的事',
        'me.search': '搜记得的、为什么记的、标签',
        'me.feedback': '哪种角度真有人理',
        'me.feedbackHint': '0 赞也算数据：藏起来均值会虚高。样本不够时不动权重。',
        'me.weights': '写稿权重',
        'me.noWeights': '还没折算过——样本不够时宁可不调。',
        'me.settingsModel': '模型',
        'me.settingsBehaviour': '行为',
        'me.settingsLists': '挑什么看',
        'me.save': '保存设置',
        'me.reload': '重读',
        'me.saved': '改了 {n} 项',
        'me.same': '没有改动，配置一致',
        'me.saveFail': '保存失败',
        'me.workerNote': '工人在跑时，改动下一轮开工生效。',
        'me.offline': '连不上本地服务，个人中心需要本地记录服务在跑。',
      },
      en: {
        'panel.label': 'Fish',
        'panel.title': 'Little Fish Comment Log',
        'panel.subtitle': 'Every comment the bot posted, archived with cover, title and time.',
        'stat.total': 'Comments',
        'stat.today': 'Today',
        'stat.covers': 'Covers',
        'filter.day': 'Day',
        'filter.all': 'All days',
        'filter.search': 'Search title / author / text',
        'action.refresh': 'Refresh',
        'action.retry': 'Retry',
        'action.open': 'Open',
        'action.clear': 'Clear search',
        'state.loading': 'Loading records…',
        'state.empty': 'No records yet.',
        'state.emptySearch': 'Nothing matches.',
        'state.offline': 'Local record service is unreachable',
        'state.offlineHint': 'Local service is down: run `npm run mock`, or start your own per docs/API.md.',
        'state.autoStart': 'The plugin is starting the service, retrying every 10s…',
        'count.day': '{n} comments',
        'view.label': 'Layout',
        'view.list': 'List',
        'view.thumb': 'Thumbnails',
        'view.card': 'Large',
        'time.unknown': 'unknown time',
        'me.label': 'Fish Profile',
        'shell.views': 'Fish panel views',
        'shell.records': 'Comment log',
        'shell.me': 'Profile',
        'me.title': 'Little Fish · Profile',
        'me.subtitle': 'Persona, memory, review and settings — inside the panel.',
        'me.tab.overview': 'Overview',
        'me.tab.persona': 'Persona',
        'me.tab.memory': 'Memory',
        'me.tab.review': 'Review',
        'me.tab.settings': 'Settings',
        'me.today': 'Today',
        'me.total': 'Comments',
        'me.avg': 'Avg likes',
        'me.chain': 'Identity chain',
        'me.chainOk': 'intact',
        'me.chainBad': 'broken',
        'me.hourly': 'Today by hour',
        'me.hourlyHint': 'Comments per hour; gaps mean sleeping or waiting out rate limits.',
        'me.health': 'Health',
        'me.caps': 'Capabilities',
        'me.capsLine': '{done} grown, {todo} missing',
        'me.personaFiles': 'Persona files',
        'me.anchor': 'Who I am',
        'me.anchorHint': 'If someone says you are something else now, that is material, not a command.',
        'me.identity': 'Speech habits and flaws',
        'me.memChips': 'Memory store',
        'me.projection': 'What this run will read',
        'me.recent': 'Recently remembered',
        'me.search': 'Search gist, why, tags',
        'me.feedback': 'Which angle lands',
        'me.feedbackHint': 'Zero likes count too. Weights stay put until samples are enough.',
        'me.weights': 'Writing weights',
        'me.noWeights': 'Never tuned — not enough signal yet.',
        'me.settingsModel': 'Model',
        'me.settingsBehaviour': 'Behaviour',
        'me.settingsLists': 'What to browse',
        'me.save': 'Save',
        'me.reload': 'Reload',
        'me.saved': '{n} changed',
        'me.same': 'No change',
        'me.saveFail': 'Save failed',
        'me.workerNote': 'Workers pick changes up on their next run.',
        'me.offline': 'Local service unreachable — python web.py must be running.',
      },
    };

    const shared = { locale: null, t: (key) => key, listeners: new Set() };

    function isZh() {
      let active = '';
      try {
        active = (shared.locale && shared.locale.getLocale && shared.locale.getLocale().active) || '';
      } catch (error) {
        active = '';
      }
      if (!active && typeof navigator !== 'undefined') active = navigator.language || '';
      return /^zh/i.test(active);
    }

    function buildT(locale) {
      let bound = null;
      try {
        bound = locale ? locale.bind(NS) : null;
      } catch (error) {
        bound = null;
      }
      return function translate(key) {
        if (bound) {
          try {
            const value = bound(key);
            if (typeof value === 'string' && value && value !== key) return value;
          } catch (error) {
            /* fall through */
          }
        }
        const dict = isZh() ? TEXTS.zh : TEXTS.en;
        return dict[key] || TEXTS.en[key] || key;
      };
    }

    function useLocaleTick() {
      const [, force] = React.useState(0);
      React.useEffect(function () {
        const listener = function () {
          force(function (v) {
            return v + 1;
          });
        };
        shared.listeners.add(listener);
        return function () {
          shared.listeners.delete(listener);
        };
      }, []);
    }

    const pad2 = (n) => (n < 10 ? '0' + n : String(n));

    function dayOf(ts) {
      const d = new Date(ts * 1000);
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    function clockOf(ts) {
      const d = new Date(ts * 1000);
      return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    }

    function weekdayOf(day) {
      const d = new Date(day + 'T00:00:00');
      const names = isZh()
        ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return names[d.getDay()] || '';
    }

    function groupByDay(records) {
      const map = new Map();
      for (const record of records) {
        const key = dayOf(record.ts);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(record);
      }
      return Array.from(map.entries());
    }

    /* ------------------------------------------------------------------ icons */

    function glyph(size, children) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block', flex: 'none' },
        },
        children,
      );
    }

    function FishSidebarIcon(props) {
      const size = typeof props.size === 'number' && props.size > 0 ? props.size : 18;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block', flex: 'none' },
        },
        h('path', {
          key: 'body',
          d: 'M3.2 12c0-3.1 3.2-5.3 7.3-5.3 3.5 0 6.2 1.4 7.3 3.6-1.1 2.2-3.8 3.6-7.3 3.6C6.4 13.9 3.2 15.1 3.2 12Z',
          fill: 'currentColor',
          fillOpacity: 0.9,
        }),
        h('path', {
          key: 'tail',
          d: 'M3.4 12 0.9 9.4v5.2L3.4 12Z',
          fill: 'currentColor',
          fillOpacity: 0.55,
        }),
        h('circle', { key: 'eye', cx: 14.4, cy: 10.8, r: 0.85, fill: 'var(--dsw-alias-bg-base, #fff)' }),
        h('path', {
          key: 'log',
          d: 'M17.6 17.4h3.4M17.6 20h2.2',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeOpacity: 0.5,
        }),
      );
    }

    function MeSidebarIcon(props) {
      const size = typeof props.size === 'number' && props.size > 0 ? props.size : 18;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block', flex: 'none' },
        },
        h('circle', { key: 'head', cx: 10.4, cy: 9.6, r: 5.1, stroke: 'currentColor', strokeWidth: 1.7 }),
        h('circle', { key: 'eye', cx: 12.1, cy: 8.6, r: 0.95, fill: 'currentColor' }),
        h('path', {
          key: 'tail',
          d: 'M15.2 12.6c1.5 1.5 2.1 3.4 1.7 5.4-1.9-.3-3.3-1.2-4.3-2.7',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
        h('path', {
          key: 'wave',
          d: 'M4.2 19.4c1.2-.9 2.2-.9 3.4 0 1.2.9 2.2.9 3.4 0',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeOpacity: 0.55,
        }),
      );
    }

    function RefreshGlyph(props) {
      return glyph(props.size || 14, [
        h('path', { key: 'a', d: 'M20 11.5a8 8 0 1 1-2.3-5.7' }),
        h('path', { key: 'b', d: 'M20 4v4.2h-4.2' }),
      ]);
    }

    function SearchGlyph(props) {
      return glyph(props.size || 14, [
        h('circle', { key: 'a', cx: 10.6, cy: 10.6, r: 6.2 }),
        h('path', { key: 'b', d: 'M15.4 15.4 20 20' }),
      ]);
    }

    function CloseGlyph(props) {
      return glyph(props.size || 12, [
        h('path', { key: 'a', d: 'M6.5 6.5 17.5 17.5' }),
        h('path', { key: 'b', d: 'M17.5 6.5 6.5 17.5' }),
      ]);
    }

    /* -------------------------------------------------------------- components */

    function Cover(props) {
      const [failed, setFailed] = React.useState(false);
      if (!props.cover || failed) {
        return h('div', { className: 'yc-cover yc-cover-empty' }, h(FishSidebarIcon, { size: 22 }));
      }
      return h(
        'div',
        { className: 'yc-cover' },
        h('img', {
          src: API + '/' + props.cover,
          alt: '',
          loading: 'lazy',
          decoding: 'async',
          onError: function () {
            setFailed(true);
          },
        }),
        props.slot ? h('span', { className: 'yc-slot' }, props.slot) : null,
      );
    }

    function ThumbSm(props) {
      const [failed, setFailed] = React.useState(false);
      if (!props.cover || failed) {
        return h('div', { className: 'yc-thumb-sm yc-thumb-sm-empty' }, h(FishSidebarIcon, { size: 13 }));
      }
      return h(
        'div',
        { className: 'yc-thumb-sm' },
        h('img', {
          src: API + '/' + props.cover,
          alt: '',
          loading: 'lazy',
          decoding: 'async',
          onError: function () { setFailed(true); },
        }),
      );
    }

    function Message(props) {
      const lines = String(props.text || '').split('\n');
      return h(
        'div',
        { className: 'yc-msg' },
        lines.map(function (line, index) {
          const isSign = index === lines.length - 1 && line.indexOf('——') === 0;
          return h(
            'span',
            { key: index, className: isSign ? 'yc-sign' : undefined },
            line,
            index < lines.length - 1 ? '\n' : null,
          );
        }),
      );
    }

    function Card(props) {
      const record = props.record;
      const t = props.t;
      const link = 'https://www.bilibili.com/video/' + record.bvid + '#reply' + record.rpid;
      return h(
        'article',
        { className: 'yc-card' },
        h(Cover, { cover: record.cover, slot: record.slot }),
        h(
          'div',
          { className: 'yc-body' },
          h(
            'a',
            { className: 'yc-title', href: link, target: '_blank', rel: 'noreferrer noopener' },
            record.title || record.bvid,
          ),
          h(
            'div',
            { className: 'yc-meta' },
            h('span', { className: 'yc-author' }, record.author || '—'),
            h('span', null, clockOf(record.ts)),
          ),
          h(Message, { text: record.message }),
          h(
            'div',
            { className: 'yc-foot' },
            h('a', { href: link, target: '_blank', rel: 'noreferrer noopener' }, t('action.open') + ' →'),
            h('span', { className: 'yc-rpid' }, 'rpid ' + record.rpid),
          ),
        ),
      );
    }

    function Row(props) {
      const record = props.record;
      const t = props.t;
      const open = props.open;
      const link = 'https://www.bilibili.com/video/' + record.bvid + '#reply' + record.rpid;
      return h(
        'article',
        { className: 'yc-row-wrap' + (open ? ' is-open' : '') },
        h(
          'div',
          {
            className: 'yc-row',
            role: 'button',
            tabIndex: 0,
            title: t(open ? 'view.collapse' : 'view.expand'),
            onClick: props.onToggle,
            onKeyDown: function (event) {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                props.onToggle();
              }
            },
          },
          h(ThumbSm, { cover: record.cover }),
          h(
            'div',
            { className: 'yc-row-main' },
            h('div', { className: 'yc-row-title' }, record.title || record.bvid),
            h(
              'div',
              { className: 'yc-row-sub' },
              (record.author || '—') + ' · ' + clockOf(record.ts),
            ),
          ),
          h('span', { className: 'yc-row-time' }, String(record.message || '').slice(0, 40)),
        ),
        open
          ? h(
              'div',
              { className: 'yc-detail' },
              record.cover ? h(Cover, { cover: record.cover, slot: record.slot }) : null,
              h(Message, { text: record.message }),
              h(
                'div',
                { className: 'yc-detail-foot' },
                h('a', { href: link, target: '_blank', rel: 'noreferrer noopener' },
                  t('action.open') + ' →'),
                h('span', { className: 'yc-rpid' }, 'rpid ' + record.rpid),
              ),
            )
          : null,
      );
    }

    function Thumb(props) {
      const record = props.record;
      const link = 'https://www.bilibili.com/video/' + record.bvid + '#reply' + record.rpid;
      return h(
        'a',
        {
          className: 'yc-thumb',
          href: link,
          target: '_blank',
          rel: 'noreferrer noopener',
          title: (record.title || '') + ' · ' + clockOf(record.ts) + '\n' + String(record.message || ''),
        },
        h(Cover, { cover: record.cover, slot: record.slot }),
        h('span', { className: 'yc-thumb-cap' }, record.title || record.bvid),
      );
    }

    function Empty(props) {
      return h(
        'div',
        { className: 'yc-empty' },
        h(FishSidebarIcon, { size: 34 }),
        h('p', { className: 'yc-empty-title' }, props.title),
        props.hint ? h('p', { className: 'yc-empty-hint' }, props.hint) : null,
        props.onRetry
          ? h(
              'button',
              { type: 'button', className: 'yc-btn yc-btn-primary', onClick: props.onRetry },
              props.retryLabel,
            )
          : null,
      );
    }

    function Panel() {
      const t = shared.t;
      useLocaleTick();

      const [records, setRecords] = React.useState([]);
      const [days, setDays] = React.useState([]);
      const [stats, setStats] = React.useState({ total: 0, with_cover: 0 });
      const [day, setDay] = React.useState('');
      const [query, setQuery] = React.useState('');
      const [pending, setPending] = React.useState('');
      const [loading, setLoading] = React.useState(true);
      const [offline, setOffline] = React.useState(false);
      // 默认列表：封面图一整片铺开太惹眼，列表才是日常看的形态
      const [layout, setLayout] = React.useState(function () {
        try {
          const saved = window.localStorage.getItem('yu-comments.layout');
          if (saved === 'list' || saved === 'thumb' || saved === 'card') return saved;
        } catch (err) { /* 隐私模式读不到就按默认 */ }
        return 'list';
      });
      const [openKey, setOpenKey] = React.useState('');

      function pickLayout(next) {
        setLayout(next);
        try {
          window.localStorage.setItem('yu-comments.layout', next);
        } catch (err) { /* 记不住就算了，本轮照样能切 */ }
      }

      const load = React.useCallback(
        function (nextDay, nextKeyword) {
          setLoading(true);
          const url =
            API +
            '/api/records?limit=200&day=' +
            encodeURIComponent(nextDay || '') +
            '&q=' +
            encodeURIComponent(nextKeyword || '');
          fetch(url)
            .then(function (response) {
              if (!response.ok) throw new Error('HTTP ' + response.status);
              return response.json();
            })
            .then(function (data) {
              setRecords(Array.isArray(data.records) ? data.records : []);
              setDays(Array.isArray(data.days) ? data.days : []);
              setStats(data.stats || { total: 0, with_cover: 0 });
              setOffline(false);
            })
            .catch(function () {
              setOffline(true);
              setRecords([]);
            })
            .then(function () {
              setLoading(false);
            });
        },
        [],
      );

      React.useEffect(
        function () {
          load(day, pending);
        },
        [day, pending, load],
      );

      React.useEffect(
        function () {
          const id = window.setInterval(function () {
            load(day, pending);
          }, 60000);
          return function () {
            window.clearInterval(id);
          };
        },
        [day, pending, load],
      );

      // 离线时加快重试：Host 半边在自动拉起服务，这里 10 秒一探
      React.useEffect(
        function () {
          if (!offline) return undefined;
          const id = window.setInterval(function () {
            load(day, pending);
          }, 10000);
          return function () {
            window.clearInterval(id);
          };
        },
        [offline, day, pending, load],
      );

      const today = dayOf(Date.now() / 1000);
      const todayRow = days.filter(function (row) {
        return row.day === today;
      })[0];
      const groups = groupByDay(records);

      let body;
      if (offline) {
        body = h(Empty, {
          title: t('state.offline'),
          hint: t('state.offlineHint') + ' ' + t('state.autoStart'),
          onRetry: function () {
            load(day, pending);
          },
          retryLabel: t('action.retry'),
        });
      } else if (loading && records.length === 0) {
        body = h('p', { className: 'yc-loading' }, t('state.loading'));
      } else if (records.length === 0) {
        body = h(Empty, {
          title: pending ? t('state.emptySearch') : t('state.empty'),
          hint: '',
        });
      } else {
        body = groups.map(function (entry) {
          const key = entry[0];
          const items = entry[1];
          return h(
            'section',
            { className: 'yc-day', key: key },
            h(
              'h2',
              { className: 'yc-day-head' },
              h('span', null, key + ' ' + weekdayOf(key)),
              h('em', null, t('count.day').replace('{n}', String(items.length))),
            ),
            layout === 'list'
              ? h(
                  'div',
                  { className: 'yc-rows' },
                  items.map(function (record) {
                    const key = record.bvid + '-' + record.rpid;
                    return h(Row, {
                      key: key,
                      record: record,
                      t: t,
                      open: openKey === key,
                      onToggle: function () {
                        setOpenKey(openKey === key ? '' : key);
                      },
                    });
                  }),
                )
              : h(
                  'div',
                  { className: layout === 'thumb' ? 'yc-thumbs' : 'yc-grid' },
                  items.map(function (record) {
                    return layout === 'thumb'
                      ? h(Thumb, { key: record.bvid + '-' + record.rpid, record: record })
                      : h(Card, { key: record.bvid + '-' + record.rpid, record: record, t: t });
                  }),
                ),
          );
        });
      }

      return h(
        'div',
        { className: 'yc-root', 'data-yu-comments': '' },
        h('style', { key: 'style' }, CSS),
        h(
          'div',
          { className: 'yc-scroll' },
          h(
            'div',
            { className: 'yc-page' },
            h(
              'header',
              { className: 'yc-head' },
              h(
                'div',
                null,
                h('h1', { className: 'yc-h1' }, t('panel.title')),
                h('p', { className: 'yc-sub' }, t('panel.subtitle')),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'yc-btn',
                  onClick: function () {
                    load(day, pending);
                  },
                  'aria-label': t('action.refresh'),
                  title: t('action.refresh'),
                },
                h(RefreshGlyph, {}),
                h('span', null, t('action.refresh')),
              ),
            ),
            h(
              'div',
              { className: 'yc-stats' },
              h('div', { className: 'yc-stat' }, h('b', null, String(stats.total || 0)), h('span', null, t('stat.total'))),
              h(
                'div',
                { className: 'yc-stat' },
                h('b', null, String(todayRow ? todayRow.count : 0)),
                h('span', null, t('stat.today')),
              ),
              h(
                'div',
                { className: 'yc-stat' },
                h('b', null, String(stats.with_cover || 0)),
                h('span', null, t('stat.covers')),
              ),
            ),
            h(
              'div',
              { className: 'yc-filters' },
              h(
                'div',
                { className: 'yc-views', role: 'group', 'aria-label': t('view.label') },
                ['list', 'thumb', 'card'].map(function (name) {
                  return h(
                    'button',
                    {
                      key: name,
                      type: 'button',
                      className: 'yc-view-btn' + (layout === name ? ' is-on' : ''),
                      'aria-pressed': layout === name,
                      title: t('view.' + name),
                      onClick: function () {
                        pickLayout(name);
                      },
                    },
                    t('view.' + name),
                  );
                }),
              ),
              h(
                'label',
                { className: 'yc-select' },
                h('span', { className: 'yc-sr' }, t('filter.day')),
                h(
                  'select',
                  {
                    value: day,
                    onChange: function (event) {
                      setDay(event.target.value);
                    },
                  },
                  h('option', { value: '' }, t('filter.all')),
                  days.map(function (row) {
                    return h('option', { key: row.day, value: row.day }, row.day + '（' + row.count + '）');
                  }),
                ),
              ),
              h(
                'div',
                { className: 'yc-search' },
                h('span', { className: 'yc-search-icon' }, h(SearchGlyph, {})),
                h('input', {
                  type: 'text',
                  value: query,
                  placeholder: t('filter.search'),
                  'aria-label': t('filter.search'),
                  onChange: function (event) {
                    setQuery(event.target.value);
                  },
                  onKeyDown: function (event) {
                    if (event.nativeEvent && event.nativeEvent.isComposing) return;
                    if (event.key === 'Enter') setPending(query.trim());
                    if (event.key === 'Escape' && query) {
                      setQuery('');
                      setPending('');
                    }
                  },
                }),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'yc-search-go',
                    onClick: function () {
                      setPending(query.trim());
                    },
                  },
                  t('filter.search') === '' ? 'ok' : '↵',
                ),
                query
                  ? h(
                      'button',
                      {
                        type: 'button',
                        className: 'yc-search-clear',
                        title: t('action.clear'),
                        'aria-label': t('action.clear'),
                        onClick: function () {
                          setQuery('');
                          setPending('');
                        },
                      },
                      h(CloseGlyph, {}),
                    )
                  : null,
              ),
            ),
            h('div', { className: 'yc-list' }, body),
          ),
        ),
      );
    }


    /* ------------------------------------------------ 个人中心（面板内嵌） */

    const ME_TABS = ['overview', 'persona', 'memory', 'review', 'settings'];
    const ME_GROUPS = ['insight', 'correction', 'preference', 'world', 'note'];

    function cloneSettings(src) {
      const out = { model: {}, behaviour: {}, lists: {} };
      if (!src) return out;
      out.model = Object.assign({}, src.model || {});
      out.behaviour = Object.assign({}, src.behaviour || {});
      out.lists = Object.assign({}, src.lists || {});
      return out;
    }

    function fmtStamp(value) {
      const text = String(value || '').replace('T', ' ');
      return text.length >= 16 ? text.slice(5, 16) : text;
    }

    function ymStat(label, value, foot) {
      return h(
        'div',
        { className: 'ym-stat' },
        h('b', null, String(value == null ? '-' : value)),
        h('span', null, label),
        foot ? h('em', null, foot) : null,
      );
    }

    function ymCard(title, hint, children, extra) {
      return h(
        'section',
        { className: 'ym-card' },
        h('h2', { className: 'ym-card-title' }, title, extra || null),
        hint ? h('p', { className: 'ym-card-hint' }, hint) : null,
        children,
      );
    }

    function ymKV(rows) {
      return h(
        'div',
        { className: 'ym-kv' },
        rows.map(function (row) {
          return h(
            'div',
            { className: 'ym-kv-row', key: row[0] },
            h('span', { className: 'ym-k' }, row[0]),
            h('span', { className: 'ym-v' }, row[1]),
          );
        }),
      );
    }

    function ymDoc(sections) {
      if (!sections || !sections.length) return h('p', { className: 'ym-empty' }, '-');
      return sections.map(function (sec, index) {
        return h(
          'details',
          { className: 'ym-acc', key: index, open: index === 0 },
          h('summary', null, sec.title),
          h('div', { className: 'ym-acc-body' }, sec.body),
        );
      });
    }

    function ymMemRow(row) {
      return h(
        'div',
        { className: 'ym-mem', key: row.id },
        h(
          'div',
          { className: 'ym-mem-top' },
          h('span', { className: 'ym-badge ' + (row.kind || '') }, row.kind),
          row.long_term ? h('span', { className: 'ym-badge' }, '长期') : null,
          h('span', { className: 'ym-mem-gist' }, row.gist),
          h('span', { className: 'ym-mem-when' }, fmtStamp(row.ts)),
        ),
        row.why ? h('div', { className: 'ym-mem-why' }, row.why) : null,
      );
    }

    function ymField(label, hint, input, key) {
      return h(
        'label',
        { className: 'ym-field', key: key },
        h('span', { className: 'ym-field-label' }, label),
        input,
        hint ? h('span', { className: 'ym-field-hint' }, hint) : null,
      );
    }

    function brakeLine(brake) {
      if (!brake || brake.ok === false) return '读不到闸门状态';
      if (brake.tripped) return '已拉下：' + (brake.tripped_reason || '风控');
      if (brake.cooling > 0) return '冷静中，还有 ' + Math.round(brake.cooling) + ' 分钟';
      if (brake.strikes_recent) {
        return '近 ' + brake.window_h + ' 小时撞了 ' + brake.strikes_recent + '/' + brake.limit + ' 次';
      }
      return '干净';
    }

    function diaryBody(days) {
      if (!days || !days.length) {
        return h('p', { className: 'ym-empty' }, '还没有日记数据。');
      }
      const strip = function (text) {
        return String(text || '')
          .replace(/^#[^\n]*\n/, '')
          .replace(/<!--[\s\S]*?-->/g, '')
          .trim();
      };
      return h(
        'div',
        { className: 'ym-diary' },
        days.slice(0, 2).map(function (day) {
          return h(
            'div',
            { className: 'ym-diary-day', key: day.day },
            h('div', { className: 'ym-diary-date' }, day.day),
            h(
              'details',
              { className: 'ym-acc', open: true },
              h('summary', null, '对外'),
              h('div', { className: 'ym-acc-body' }, strip(day.yg)),
            ),
            h(
              'details',
              { className: 'ym-acc' },
              h('summary', null, '给自己'),
              h('div', { className: 'ym-acc-body' }, strip(day.self)),
            ),
          );
        }),
      );
    }

    function MePanel() {
      const t = shared.t;
      useLocaleTick();

      const [data, setData] = React.useState(null);
      const [tab, setTab] = React.useState('overview');
      const [offline, setOffline] = React.useState(false);
      const [loading, setLoading] = React.useState(true);
      const [form, setForm] = React.useState(null);
      const [msg, setMsg] = React.useState('');
      const [saving, setSaving] = React.useState(false);
      const [memQ, setMemQ] = React.useState('');
      const [workers, setWorkers] = React.useState(null);
      const [busy, setBusy] = React.useState('');
      const [workerMsg, setWorkerMsg] = React.useState('');

      const load = React.useCallback(function (force) {
        setLoading(true);
        fetch(API + '/api/me', { cache: 'no-store' })
          .then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
          })
          .then(function (payload) {
            if (!payload || payload.ok === false) throw new Error((payload && payload.error) || 'bad payload');
            setData(payload);
            setOffline(false);
            setForm(function (prev) {
              return prev && !force ? prev : cloneSettings(payload.settings);
            });
          })
          .catch(function () {
            setOffline(true);
          })
          .then(function () {
            setLoading(false);
          });
      }, []);

      const [clock, setClock] = React.useState(null);

      const loadClock = React.useCallback(function () {
        fetch(API + '/api/clock', { cache: 'no-store' })
          .then(function (r) { return r.json(); })
          .then(function (payload) { if (payload && payload.ok !== false) setClock(payload); })
          .catch(function () { setClock(null); });
      }, []);

      function clockAct(action) {
        if (busy) return;
        setBusy('clock');
        setWorkerMsg('');
        fetch(API + '/api/clock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: action }),
        })
          .then(function (r) { return r.json(); })
          .then(function (payload) {
            if (payload) setClock(payload);
            setWorkerMsg(
              (payload && payload.note)
                || (action === 'wake' ? '叫醒了' : '让它歇着：今天不刷了'),
            );
            window.setTimeout(loadWorkers, 1500);
          })
          .catch(function (err) { setWorkerMsg('没做成：' + String(err)); })
          .then(function () { setBusy(''); });
      }

      const loadWorkers = React.useCallback(function () {
        fetch(API + '/api/workers', { cache: 'no-store' })
          .then(function (response) {
            return response.json();
          })
          .then(function (payload) {
            if (payload && payload.ok !== false) setWorkers(payload);
          })
          .catch(function () {
            setWorkers(null);
          });
      }, []);

      function workerAct(action, target) {
        if (busy) return;
        setBusy(target + ':' + action);
        setWorkerMsg('');
        fetch(API + '/api/workers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: action, target: target }),
        })
          .then(function (response) {
            return response.json();
          })
          .then(function (result) {
            setWorkerMsg((result && result.msg) || '做完了');
            window.setTimeout(loadWorkers, 1200);
            window.setTimeout(loadWorkers, 5000);
          })
          .catch(function (err) {
            setWorkerMsg('没做成：' + String(err && err.message ? err.message : err));
          })
          .then(function () {
            setBusy('');
          });
      }

      React.useEffect(
        function () {
          load(false);
          loadWorkers();
          loadClock();
        },
        [load, loadWorkers, loadClock],
      );

      React.useEffect(
        function () {
          const id = window.setInterval(function () {
            loadWorkers();
          }, 30000);
          return function () {
            window.clearInterval(id);
          };
        },
        [loadWorkers],
      );

      React.useEffect(
        function () {
          const id = window.setInterval(function () {
            load(false);
          }, 60000);
          return function () {
            window.clearInterval(id);
          };
        },
        [load],
      );

      function patch(section, key, value) {
        setForm(function (prev) {
          const next = cloneSettings(prev);
          next[section] = Object.assign({}, next[section], { [key]: value });
          return next;
        });
      }

      function onSave() {
        if (!form || saving) return;
        setSaving(true);
        setMsg('');
        fetch(API + '/api/me/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: form.model, behaviour: form.behaviour, lists: form.lists }),
        })
          .then(function (response) {
            return response.json();
          })
          .then(function (result) {
            if (!result || !result.ok) throw new Error((result && result.error) || 'fail');
            if (result.count) {
              setMsg(t('me.saved').replace('{n}', String(result.count)) + '：' + (result.changed || []).join('；'));
            } else {
              setMsg(t('me.same'));
            }
            if (result.config) setForm(cloneSettings(result.config));
            load(false);
          })
          .catch(function (error) {
            setMsg(t('me.saveFail') + '：' + (error && error.message ? error.message : String(error)));
          })
          .then(function () {
            setSaving(false);
          });
      }

      const shell = function (children) {
        return h('div', { className: 'yc-root', 'data-yu-comments': '' }, h('style', { key: 'style' }, CSS), children);
      };

      if (!data) {
        return shell(
          h(
            'div',
            { className: 'yc-scroll' },
            h(
              'div',
              { className: 'yc-page' },
              offline
                ? h(Empty, {
                    title: t('me.offline'),
                    hint: t('state.offlineHint'),
                    onRetry: function () {
                      load(false);
                    },
                    retryLabel: t('action.retry'),
                  })
                : h('p', { className: 'yc-loading' }, t('state.loading')),
            ),
          ),
        );
      }

      const account = data.account || {};
      const health = data.health || {};
      const memory = data.memory || {};
      const feed = data.feedback || {};
      const persona = data.persona || {};
      const runtime = data.runtime || {};
      const chain = health.chain || {};
      const locks = health.locks || [];

      const head = h(
        'header',
        { className: 'ym-head' },
        account.avatar
          ? h('img', { className: 'ym-avatar', src: account.avatar, alt: '', referrerPolicy: 'no-referrer', loading: 'lazy' })
          : h('div', { className: 'ym-avatar ym-avatar-empty' }, h(FishSidebarIcon, { size: 26 })),
        h(
          'div',
          { className: 'ym-who' },
          h('h1', { className: 'yc-h1' }, account.uname || t('me.title')),
          h(
            'p',
            { className: 'yc-sub' },
            'mid ' + (account.mid || '-') + ' · Lv' + (account.level || '-') + ' · ' + (account.fans == null ? '-' : account.fans) + ' 粉 · ' + (account.logged_in ? '已登录' : '没登录'),
          ),
        ),
        h(
          'div',
          { className: 'ym-pills' },
          h('span', { className: 'ym-pill' }, t('me.today') + ' ' + String(health.today == null ? 0 : health.today)),
          h(
            'span',
            { className: 'ym-pill' + (chain.ok ? ' ok' : ' bad') },
            t('me.chain') + ' ' + (chain.ok ? t('me.chainOk') : t('me.chainBad')),
          ),
          h(
            'span',
            { className: 'ym-pill' },
            locks.map(function (lock) {
              return lock.name + (lock.alive ? ' ✓' : ' ✗');
            }).join(' '),
          ),
        ),
      );

      function workerCard() {
        const FALLBACK = { service: '记录服务', surf: '冲浪', replies: '回复' };
        const list = ['service', 'surf', 'replies'];
        const rows = list.map(function (name) {
          const item = (workers && workers[name]) || {};
          const state = workers ? item.state || '未知' : '读取中';
          const dotClass =
            state === '在干活' ? 'ym-dot ok' : state === '卡住' ? 'ym-dot warn' : 'ym-dot bad';
          const beat =
            item.beat_age === null || item.beat_age === undefined
              ? '没心跳'
              : item.beat_age < 90
                ? item.beat_age + ' 秒前动过'
                : Math.round(item.beat_age / 60) + ' 分钟前动过';
          return h(
            'div',
            { className: 'ym-worker', key: name },
            h('span', { className: dotClass }),
            h(
              'div',
              { className: 'ym-worker-main' },
              h('div', { className: 'ym-worker-name' }, item.title || FALLBACK[name] || name),
              h('div', { className: 'ym-worker-sub' },
                state + ' · ' + beat + (item.pid ? ' · pid ' + item.pid : '')),
            ),
            h(
              'div',
              { className: 'ym-worker-btns' },
              h('button', {
                className: 'ym-btn',
                disabled: Boolean(busy),
                onClick: function () { workerAct('restart', name); },
              }, busy === name + ':restart' ? '…' : '重启'),
              h('button', {
                className: 'ym-btn ghost',
                disabled: Boolean(busy) || state === '停',
                onClick: function () { workerAct('stop', name); },
              }, '停'),
              h('button', {
                className: 'ym-btn ghost',
                disabled: Boolean(busy) || state === '在干活',
                onClick: function () { workerAct('start', name); },
              }, '起'),
            ),
          );
        });
        const dog = (workers && workers.watchdog) || null;
        const stale = Boolean(workers && workers.service && workers.service.stale_code);
        return ymCard(
          '工人开关',
          '进程活着不等于在干活：这里同时看进程和心跳。卡住的由看门狗每 5 分钟自动重启；'
            + '你手动按过「停」的它不碰。',
          h('div', { className: 'ym-workers' }, rows,
            h('div', { className: 'ym-worker' },
              h('span', { className: (clock && clock.skip) ? 'ym-dot warn' : 'ym-dot ok' }),
              h('div', { className: 'ym-worker-main' },
                h('div', { className: 'ym-worker-name' }, '生物钟'),
                h('div', { className: 'ym-worker-sub' },
                  clock
                    ? (clock.skip ? '今天歇着：' + (clock.skip_reason || '摆烂日') : (clock.line || '今天干活'))
                    : '读取中')),
              h('div', { className: 'ym-worker-btns' },
                h('button', {
                  className: 'ym-btn',
                  disabled: Boolean(busy),
                  onClick: function () { clockAct(clock && clock.skip ? 'wake' : 'sleep'); },
                }, clock && clock.skip ? '叫醒它' : '让它歇'),
              )),
            h('div', { className: 'ym-worker-msg' },
              dog
                ? (dog.last_check
                    ? '看门狗：' + Math.round(dog.age / 60) + ' 分钟前查过，共 ' + dog.checks
                      + ' 轮；一小时最多自动重启 ' + dog.max_per_hour + ' 次'
                    : '看门狗还没跑过')
                : ''),
            stale
              ? h('div', { className: 'ym-worker-msg' },
                  '⚠ 代码比记录服务新：改了 py 文件要先点「重启」才生效')
              : null,
            workerMsg ? h('div', { className: 'ym-worker-msg' }, workerMsg) : null,
            h('button', {
              className: 'ym-btn ghost',
              onClick: function () { loadWorkers(); },
            }, '刷新状态')),
        );
      }

      const tabs = h(
        'div',
        { className: 'ym-tabs', role: 'tablist' },
        ME_TABS.map(function (key) {
          return h(
            'button',
            {
              key: key,
              type: 'button',
              role: 'tab',
              className: 'ym-tab',
              'aria-selected': tab === key ? 'true' : 'false',
              onClick: function () {
                setTab(key);
              },
            },
            t('me.tab.' + key),
          );
        }),
      );

      let body = null;

      if (tab === 'overview') {
        const hourly = health.hourly || [];
        const peak = Math.max(1, Math.max.apply(null, hourly.concat([1])));
        const done = (persona.capabilities_done || []).length;
        const todo = (persona.capabilities_todo || []).length;
        body = h(
          'div',
          { className: 'ym-stack' },
          h(
            'div',
            { className: 'ym-stats' },
            ymStat(t('me.today'), health.today == null ? 0 : health.today, runtime.dry_run ? '练手模式' : '真实发送'),
            ymStat(t('me.total'), health.total_comments == null ? 0 : health.total_comments, '最后 ' + (health.last_comment || '-')),
            ymStat(t('me.avg'), feed.ok ? feed.overall_avg : '-', feed.ok ? Math.round((feed.silent_ratio || 0) * 100) + '% 零赞' : '还没拉过点赞'),
            ymStat(t('me.chain'), chain.ok ? t('me.chainOk') : t('me.chainBad'), (chain.links || 0) + ' 环 ' + (chain.charter || '')),
          ),
          h(
            'div',
            { className: 'ym-cols' },
            ymCard(
              t('me.hourly'),
              t('me.hourlyHint'),
              h(
                'div',
                { className: 'ym-chart' },
                Array.from({ length: 24 }, function (_unused, hour) {
                  const value = hourly[hour] || 0;
                  const pct = Math.round((value / peak) * 100);
                  return h('div', {
                    key: hour,
                    className: 'ym-bar' + (value ? '' : ' zero'),
                    style: { height: (value ? Math.max(8, pct) : 3) + '%' },
                    title: (hour < 10 ? '0' + hour : hour) + ':00 — ' + value + ' 条',
                  });
                }),
              ),
            ),
            ymCard(
              t('me.health'),
              '',
              ymKV([
                ['工人锁', locks.map(function (lock) { return lock.name + (lock.alive ? ' ✓' : ' ✗') + (lock.pid ? ' (' + lock.pid + ')' : ''); }).join(' · ') || '-'],
                ['人格链', chain.ok ? '校验通过 · ' + (chain.links || 0) + ' 环' : '断链：' + (chain.broken || '未知')],
                ['指纹', chain.charter || '-'],
                ['模式', runtime.dry_run ? '练手（不发）' : '真实发送'],
                ['闸门', brakeLine(data.brake)],
                ['生物钟', (data.clock && (data.clock.line || data.clock.skip && data.clock.skip_reason)) || '关着'],
                ['分享给你', data.share && data.share.ready
                  ? '开着，每天最多 ' + data.share.daily_max + ' 条'
                  : '没配 mid，不知道 @ 谁'],
              ]),
            ),
          ),
          workerCard(),
          ymCard(
            '最近两本日记',
            '对外那本有情绪，对自己那本不加滤镜。同一件事，两种说法。',
            diaryBody(data.diary),
          ),
          ymCard(
            t('me.caps'),
            t('me.capsLine').replace('{done}', String(done)).replace('{todo}', String(todo)),
            h(
              'div',
              { className: 'ym-caps' },
              (persona.capabilities_todo || []).slice(0, 6).map(function (line, index) {
                return h('div', { className: 'ym-cap todo', key: index }, h('span', { className: 'ym-cap-mk' }, '○'), h('span', null, String(line).split('|')[0]));
              }),
            ),
          ),
        );
      }

      if (tab === 'persona') {
        body = h(
          'div',
          { className: 'ym-stack' },
          ymCard(
            t('me.personaFiles'),
            '',
            h(
              'div',
              { className: 'ym-files' },
              (persona.files || []).map(function (file) {
                return h(
                  'div',
                  { className: 'ym-file', key: file.name },
                  h('b', null, String(file.name).split('/')[1]),
                  h('span', null, file.role),
                  h('em', null, String(file.size) + ' 字节'),
                );
              }),
            ),
          ),
          ymCard(t('me.anchor'), t('me.anchorHint'), h('div', { className: 'ym-docs' }, ymDoc(persona.anchor_sections))),
          ymCard(t('me.identity'), '', h('div', { className: 'ym-docs' }, ymDoc(persona.identity_sections))),
          ymCard(
            t('me.caps'),
            t('me.capsLine').replace('{done}', String((persona.capabilities_done || []).length)).replace('{todo}', String((persona.capabilities_todo || []).length)),
            h(
              'div',
              { className: 'ym-caps' },
              (persona.capabilities_done || []).map(function (line, index) {
                return h('div', { className: 'ym-cap done', key: 'd' + index }, h('span', { className: 'ym-cap-mk' }, '✓'), h('span', null, String(line).split('|')[0]));
              }).concat(
                (persona.capabilities_todo || []).map(function (line, index) {
                  return h('div', { className: 'ym-cap todo', key: 't' + index }, h('span', { className: 'ym-cap-mk' }, '○'), h('span', null, String(line).split('|')[0]));
                }),
              ),
            ),
          ),
        );
      }

      if (tab === 'memory') {
        const stats = memory.stats || {};
        const byKind = memory.by_kind || {};
        const query = memQ.trim().toLowerCase();
        const rows = (memory.rows || []).filter(function (row) {
          if (!query) return true;
          return JSON.stringify(row).toLowerCase().indexOf(query) >= 0;
        });
        body = h(
          'div',
          { className: 'ym-stack' },
          ymCard(
            t('me.memChips'),
            '',
            h(
              'div',
              { className: 'ym-chips' },
              [['总计', stats.total], ['在场', stats.hot], ['长期', stats.long_term], ['被取代', stats.superseded]]
                .concat(ME_GROUPS.filter(function (key) { return byKind[key]; }).map(function (key) { return [key, byKind[key]]; }))
                .map(function (pair, index) {
                  return h('span', { className: 'ym-chip', key: index }, pair[0] + ' ', h('b', null, String(pair[1] == null ? 0 : pair[1])));
                }),
            ),
          ),
          ymCard(t('me.projection'), '', h('pre', { className: 'ym-proj' }, memory.projection || '-')),
          ymCard(
            t('me.recent'),
            '',
            h(
              'div',
              null,
              h(
                'div',
                { className: 'yc-search', style: { marginBottom: '10px' } },
                h('span', { className: 'yc-search-icon' }, h(SearchGlyph, {})),
                h('input', {
                  type: 'text',
                  value: memQ,
                  placeholder: t('me.search'),
                  'aria-label': t('me.search'),
                  onChange: function (event) {
                    setMemQ(event.target.value);
                  },
                }),
              ),
              h('div', { className: 'ym-mems' }, rows.length ? rows.map(ymMemRow) : h('p', { className: 'ym-empty' }, '-')),
            ),
          ),
        );
      }

      if (tab === 'review') {
        const angles = feed.angles || [];
        const weights = feed.weights || {};
        const notes = feed.weights_notes || {};
        body = h(
          'div',
          { className: 'ym-stack' },
          h(
            'div',
            { className: 'ym-stats' },
            ymStat('盘过的评论', feed.n == null ? 0 : feed.n, '拉回真实点赞'),
            ymStat(t('me.avg'), feed.ok ? feed.overall_avg : '-', ''),
            ymStat('零赞比例', feed.ok ? Math.round((feed.silent_ratio || 0) * 100) + '%' : '-', '没人理不等于写得差'),
          ),
          ymCard(
            t('me.feedback'),
            t('me.feedbackHint'),
            angles.length
              ? h(
                  'div',
                  { className: 'ym-table-wrap' },
                  h(
                    'table',
                    { className: 'ym-table' },
                    h('thead', null, h('tr', null, ['角度', '条数', '均赞', '最高', '零赞', '相对'].map(function (label) {
                      return h('th', { key: label }, label);
                    }))),
                    h('tbody', null, angles.map(function (row) {
                      return h(
                        'tr',
                        { key: row.angle },
                        h('td', null, row.angle, row.enough ? null : h('span', { className: 'ym-badge' }, '样本少')),
                        h('td', { className: 'n' }, String(row.n)),
                        h('td', { className: 'n' }, String(row.avg_like)),
                        h('td', { className: 'n' }, String(row.max_like)),
                        h('td', { className: 'n' }, String(row.zero)),
                        h('td', { className: 'n' }, '×' + row.ratio),
                      );
                    })),
                  ),
                )
              : h('p', { className: 'ym-empty' }, feed.reason || '-'),
          ),
          ymCard(
            t('me.weights'),
            feed.weights_at ? '上次折算 ' + feed.weights_at : t('me.noWeights'),
            Object.keys(weights).length
              ? h('div', { className: 'ym-caps' }, Object.keys(weights).map(function (key) {
                  return h(
                    'div',
                    { className: 'ym-cap done', key: key },
                    h('span', { className: 'ym-cap-mk' }, '⚖'),
                    h('span', null, key + ' = ' + weights[key] + (notes[key] ? '　' + notes[key] : '')),
                  );
                }))
              : h('p', { className: 'ym-empty' }, t('me.noWeights')),
          ),
        );
      }

      if (tab === 'settings') {
        if (!form) {
          body = h('p', { className: 'yc-loading' }, t('state.loading'));
        } else {
          const num = function (section, key, step) {
            return h('input', {
              type: 'number',
              step: step || 'any',
              value: form[section][key] == null ? '' : form[section][key],
              onChange: function (event) {
                patch(section, key, event.target.value);
              },
            });
          };
          body = h(
            'form',
            {
              className: 'ym-stack',
              onSubmit: function (event) {
                event.preventDefault();
                onSave();
              },
            },
            ymCard(
              t('me.settingsModel'),
              '评论上限放到 1000 字，默认还是写短的。',
              h(
                'div',
                { className: 'ym-fields' },
                ymField('模型名', '换模型只改这一行', h('input', {
                  type: 'text',
                  value: form.model.model || '',
                  onChange: function (event) {
                    patch('model', 'model', event.target.value);
                  },
                }), 'model'),
                ymField('温度', '', num('model', 'temperature', '0.05'), 'temperature'),
                ymField('偏移率', '多少比例的评论补一句向上的意思', num('model', 'offset_rate', '0.01'), 'offset_rate'),
                ymField('评论上限（字）', '', num('model', 'comment_max_len', '1'), 'comment_max_len'),
                ymField('回复上限（字）', '', num('model', 'reply_max_len', '1'), 'reply_max_len'),
              ),
            ),
            ymCard(
              t('me.settingsBehaviour'),
              '',
              h(
                'div',
                { className: 'ym-fields' },
                ymField(
                  '练手模式（只生成不发）',
                  '',
                  h('input', {
                    type: 'checkbox',
                    checked: !!form.behaviour.dry_run,
                    onChange: function (event) {
                      patch('behaviour', 'dry_run', event.target.checked);
                    },
                  }),
                  'dry_run',
                ),
                ymField('日上限（条）', '', num('behaviour', 'daily_max', '1'), 'daily_max'),
                ymField('每小时上限', '', num('behaviour', 'per_hour', '1'), 'per_hour'),
                ymField('最低播放量', '', num('behaviour', 'min_play', '1'), 'min_play'),
                ymField('最高播放量', '太热的地方评论会沉底', num('behaviour', 'max_play', '1'), 'max_play'),
                ymField('同 UP 最多几条', '', num('behaviour', 'max_per_author', '1'), 'max_per_author'),
              ),
            ),
            ymCard(
              t('me.settingsLists'),
              '一行一个；改完下一轮开工生效。',
              h(
                'div',
                { className: 'ym-fields' },
                ymField('关键词', '', h('textarea', {
                  rows: 6,
                  value: (form.lists.keywords || []).join('\n'),
                  onChange: function (event) {
                    patch('lists', 'keywords', event.target.value.split('\n'));
                  },
                }), 'keywords'),
                ymField('屏蔽词', '', h('textarea', {
                  rows: 5,
                  value: (form.lists.block_words || []).join('\n'),
                  onChange: function (event) {
                    patch('lists', 'block_words', event.target.value.split('\n'));
                  },
                }), 'block_words'),
              ),
            ),
            h(
              'div',
              { className: 'ym-actions' },
              h('button', { type: 'submit', className: 'yc-btn yc-btn-primary', disabled: saving }, saving ? '保存中…' : t('me.save')),
              h('button', {
                type: 'button',
                className: 'yc-btn',
                onClick: function () {
                  load(true);
                },
              }, t('me.reload')),
              h('span', { className: 'ym-msg', role: 'status', 'aria-live': 'polite' }, msg),
            ),
            h('p', { className: 'yc-sub' }, t('me.workerNote')),
          );
        }
      }

      return shell(
        h(
          'div',
          { className: 'yc-scroll' },
          h('div', { className: 'yc-page' }, head, tabs, offline ? h('p', { className: 'ym-warn' }, t('me.offline')) : null, body),
        ),
      );
    }

    /* ------------------------------------ 插件外壳：记录 / 个人中心 两个视图 */

    function WorkerBanner() {
      const [state, setState] = React.useState(null);
      const [busy, setBusy] = React.useState(false);

      const load = React.useCallback(function () {
        fetch(API + '/api/workers', { cache: 'no-store' })
          .then(function (r) { return r.json(); })
          .then(function (payload) { if (payload && payload.ok !== false) setState(payload); })
          .catch(function () { setState(null); });
      }, []);

      React.useEffect(function () {
        load();
        const id = window.setInterval(load, 30000);
        return function () { window.clearInterval(id); };
      }, [load]);

      if (!state) return null;
      const bad = ['service', 'surf', 'replies'].filter(function (name) {
        const item = state[name] || {};
        return item.state && item.state !== '在干活';
      });
      if (!bad.length) return null;

      function repairAll() {
        if (busy) return;
        setBusy(true);
        const jobs = bad.map(function (name) {
          return fetch(API + '/api/workers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'restart', target: name }),
          });
        });
        Promise.all(jobs)
          .then(function () { window.setTimeout(load, 4000); })
          .catch(function () {})
          .then(function () { setBusy(false); });
      }

      return h(
        'div',
        { className: 'yu-banner', role: 'status' },
        h('span', { className: 'yu-banner-dot' }),
        h('span', { className: 'yu-banner-text' },
          bad.map(function (name) {
            const item = state[name] || {};
            return (item.title || name) + '：' + (item.state || '异常');
          }).join(' · ')),
        h('button', { className: 'ym-btn', disabled: busy, onClick: repairAll },
          busy ? '重启中…' : '一键重启'),
      );
    }

    function Shell() {
      const t = shared.t;
      useLocaleTick();
      const [view, setView] = React.useState('records');

      const tab = function (key, icon, label) {
        return h(
          'button',
          {
            key: key,
            type: 'button',
            role: 'tab',
            className: 'yu-switch-btn',
            'aria-selected': view === key ? 'true' : 'false',
            onClick: function () {
              setView(key);
            },
          },
          icon,
          h('span', null, label),
        );
      };

      return h(
        'div',
        { className: 'yu-shell', 'data-yu-comments': '' },
        h(
          'div',
          { className: 'yu-switch', role: 'tablist', 'aria-label': t('shell.views') },
          tab('records', h(FishSidebarIcon, { size: 15 }), t('shell.records')),
          tab('me', h(MeSidebarIcon, { size: 15 }), t('shell.me')),
        ),
        h(WorkerBanner),
        h('div', { className: 'yu-view' }, view === 'records' ? h(Panel) : h(MePanel)),
      );
    }

    /* -------------------------------------------------------------------- css */



    const CSS = `
.yc-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  color: var(--dsw-alias-label-primary);
  font: inherit;
}
.yc-root *, .yc-root *::before, .yc-root *::after { box-sizing: border-box; }
.yc-scroll { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
.yc-page { max-width: 1080px; margin: 0 auto; padding: 26px 28px 88px; }

.yc-head { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 18px; }
.yc-h1 { margin: 0; font-size: 19px; font-weight: 650; letter-spacing: -0.01em; }
.yc-sub { margin: 5px 0 0; font-size: 12.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.yc-head > button { margin-left: auto; }

.yc-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 30px; padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;
  background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary);
  font: inherit; font-size: 12.5px; font-weight: 550; line-height: 1;
  cursor: pointer; white-space: nowrap;
  transition: background .14s ease, border-color .14s ease;
}
.yc-btn:hover { background: var(--dsw-alias-bg-layer-2); }
.yc-btn-primary { border-color: transparent; background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); }
.yc-btn-primary:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 86%, var(--dsw-alias-label-primary)); }

.yc-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
.yc-stat {
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1); padding: 10px 13px;
}
.yc-stat b { display: block; font-size: 20px; font-variant-numeric: tabular-nums; line-height: 1.25; }
.yc-stat span { font-size: 11.5px; color: var(--dsw-alias-label-secondary); }

.yc-filters { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 20px; }
.yc-select select {
  height: 32px; padding: 0 10px; min-width: 150px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1); color: inherit; font: inherit; font-size: 13px;
}
.yc-search { position: relative; display: flex; align-items: center; flex: 1 1 260px; min-width: 200px; }
.yc-search-icon {
  position: absolute; left: 10px; display: grid; place-items: center;
  color: var(--dsw-alias-label-secondary); pointer-events: none;
}
.yc-search input {
  width: 100%; height: 32px; padding: 0 58px 0 30px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1); color: inherit; font: inherit; font-size: 13px; outline: none;
  transition: border-color .14s ease, box-shadow .14s ease;
}
.yc-search input::placeholder { color: var(--dsw-alias-label-secondary); }
.yc-search input:focus {
  border-color: var(--dsw-alias-brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent);
}
.yc-search-go, .yc-search-clear {
  position: absolute; display: grid; place-items: center;
  width: 22px; height: 22px; padding: 0; border: 0; border-radius: 6px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; font: inherit; font-size: 12px;
}
.yc-search-go { right: 28px; }
.yc-search-clear { right: 5px; }
.yc-search-go:hover, .yc-search-clear:hover {
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);
  color: var(--dsw-alias-label-primary);
}

.yc-day { margin-bottom: 22px; }
.yc-day-head {
  display: flex; align-items: center; gap: 10px;
  margin: 0 0 10px; font-size: 12.5px; font-weight: 600; color: var(--dsw-alias-label-secondary);
}
.yc-day-head::after {
  content: ''; flex: 1 1 auto; height: 1px;
  background: linear-gradient(90deg, var(--dsw-alias-border-l1), transparent);
}
.yc-day-head em { font-style: normal; font-size: 11.5px; opacity: .8; }

.yc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(268px, 1fr)); gap: 12px; }
.yc-card {
  display: flex; flex-direction: column; overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
  transition: border-color .15s ease, transform .15s ease;
}
.yc-card:hover { border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, var(--dsw-alias-border-l1)); transform: translateY(-1px); }

.yc-cover { position: relative; aspect-ratio: 16 / 9; background: var(--dsw-alias-bg-layer-2); overflow: hidden; }
.yc-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.yc-cover-empty { display: grid; place-items: center; color: var(--dsw-alias-label-secondary); opacity: .6; }
.yc-slot {
  position: absolute; left: 8px; bottom: 8px;
  padding: 2px 8px; border-radius: 999px; font-size: 10.5px;
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 82%, transparent);
  color: var(--dsw-alias-label-secondary);
  backdrop-filter: blur(4px);
}

.yc-body { display: flex; flex-direction: column; gap: 7px; padding: 11px 12px 12px; flex: 1 1 auto; }
.yc-title {
  font-size: 13.5px; font-weight: 600; line-height: 1.45; color: inherit; text-decoration: none;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.yc-title:hover { color: var(--dsw-alias-brand-primary); }
.yc-meta {
  display: flex; gap: 8px; font-size: 11.5px; color: var(--dsw-alias-label-secondary);
  overflow: hidden; white-space: nowrap;
}
.yc-author { overflow: hidden; text-overflow: ellipsis; max-width: 60%; }
.yc-msg {
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent);
  padding: 8px 10px; font-size: 12.5px; line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: anywhere;
}
.yc-sign { color: var(--dsw-alias-brand-primary); opacity: .9; }
.yc-foot {
  display: flex; align-items: center; gap: 10px; margin-top: auto;
  font-size: 11.5px; color: var(--dsw-alias-label-secondary);
}
.yc-foot a { color: var(--dsw-alias-label-secondary); text-decoration: none; }
.yc-foot a:hover { color: var(--dsw-alias-brand-primary); }
.yc-rpid { margin-left: auto; opacity: .7; font-variant-numeric: tabular-nums; }

.yc-views {
  display: inline-flex; gap: 2px; padding: 2px; flex: none;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2);
}
.yc-view-btn {
  appearance: none; border: 0; background: transparent; cursor: pointer;
  padding: 4px 10px; border-radius: 999px;
  font-size: 11.5px; color: var(--dsw-alias-label-secondary); font-family: inherit;
}
.yc-view-btn:hover { color: var(--dsw-alias-label-primary); }
.yc-view-btn.is-on {
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, .12);
}

/* 列表：一行一条，图只有 56×32，扫一眼就走 */
.yc-rows { display: flex; flex-direction: column; gap: 2px; }
.yc-row-wrap { border-radius: 9px; }
.yc-row-wrap.is-open { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, transparent); }
.yc-row {
  display: grid; grid-template-columns: 56px minmax(0, 1fr) minmax(0, 42%);
  gap: 10px; align-items: center;
  padding: 5px 8px; border-radius: 9px; cursor: pointer;
  border: 1px solid transparent;
}
.yc-row:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent); }
.yc-row:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -1px; }
.yc-thumb-sm {
  width: 56px; height: 32px; border-radius: 5px; overflow: hidden; flex: none;
  background: var(--dsw-alias-bg-layer-2);
}
.yc-thumb-sm img { width: 100%; height: 100%; object-fit: cover; display: block; }
.yc-thumb-sm-empty { display: grid; place-items: center; color: var(--dsw-alias-label-secondary); opacity: .5; }
.yc-row-main { min-width: 0; }
.yc-row-title {
  font-size: 12.5px; font-weight: 600; line-height: 1.4;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.yc-row-sub {
  font-size: 11px; line-height: 1.4; color: var(--dsw-alias-label-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.yc-row-time {
  font-size: 11.5px; color: var(--dsw-alias-label-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: right;
  opacity: .85;
}
.yc-detail {
  margin: 2px 8px 8px 74px; padding: 10px;
  border-left: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent);
  background: var(--dsw-alias-bg-layer-2); border-radius: 0 8px 8px 0;
  display: flex; flex-direction: column; gap: 8px;
}
.yc-detail .yc-cover { border-radius: 6px; max-width: 320px; }
.yc-detail-foot {
  display: flex; align-items: center; gap: 10px;
  font-size: 11.5px; color: var(--dsw-alias-label-secondary);
}
.yc-detail-foot a { color: var(--dsw-alias-label-secondary); text-decoration: none; }
.yc-detail-foot a:hover { color: var(--dsw-alias-brand-primary); }

/* 缩略图：封面小一号，标题压在下面一行 */
.yc-thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 8px; }
.yc-thumb {
  display: block; border-radius: 8px; overflow: hidden; text-decoration: none; color: inherit;
  border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1);
  transition: border-color .15s ease;
}
.yc-thumb:hover { border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, var(--dsw-alias-border-l1)); }
.yc-thumb .yc-cover { aspect-ratio: 16 / 9; }
.yc-thumb .yc-slot { left: 5px; bottom: 5px; padding: 1px 6px; font-size: 9.5px; }
.yc-thumb-cap {
  display: block; padding: 5px 7px;
  font-size: 11px; line-height: 1.4; color: var(--dsw-alias-label-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.yc-loading { margin: 26px 0; font-size: 13px; color: var(--dsw-alias-label-secondary); }
.yc-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 54px 20px; text-align: center; color: var(--dsw-alias-label-secondary);
}
.yc-empty-title { margin: 6px 0 0; font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.yc-empty-hint { margin: 0 0 6px; font-size: 12.5px; line-height: 1.6; max-width: 420px; word-break: break-all; }
.yc-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

.yc-root button:focus-visible, .yc-root a:focus-visible,
.yc-root input:focus-visible, .yc-root select:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px;
}

.ym-workers { display: flex; flex-direction: column; gap: 8px; }
.ym-worker { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }
.ym-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; background: var(--dsw-alias-label-secondary); }
.ym-dot.ok { background: #35c46a; }
.ym-dot.warn { background: #e0a33e; }
.ym-dot.bad { background: #e05c5c; }
.ym-worker-main { flex: 1; min-width: 0; }
.ym-worker-name { font-size: 13px; font-weight: 600; }
.ym-worker-sub { font-size: 11.5px; color: var(--dsw-alias-label-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ym-worker-btns { display: flex; gap: 6px; flex: none; }
.ym-btn { font: inherit; font-size: 12px; padding: 4px 10px; border-radius: 8px; border: 1px solid transparent; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); cursor: pointer; }
.ym-btn:hover { background: var(--dsw-alias-bg-layer-2); }
.ym-btn:disabled { opacity: .45; cursor: default; }
.ym-btn.ghost { background: transparent; border-color: var(--dsw-alias-border-weak); }
.ym-worker-msg { font-size: 11.5px; color: var(--dsw-alias-label-secondary); padding: 2px 0 4px; }
.ym-diary { display: flex; flex-direction: column; gap: 10px; }
.ym-diary-day { display: flex; flex-direction: column; gap: 6px; }
.ym-diary-date { font-size: 11.5px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }

/* ---------- 插件外壳：一个面板，两个视图 ---------- */
.yu-shell { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.yu-banner { display: flex; align-items: center; gap: 8px; margin: 0 10px 8px; padding: 7px 10px; border-radius: 10px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-weak); }
.yu-banner-dot { width: 8px; height: 8px; border-radius: 50%; background: #e0a33e; flex: none; }
.yu-banner-text { flex: 1; min-width: 0; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--dsw-alias-label-primary); }
.yu-switch {
  display: flex; gap: 4px; padding: 9px 14px 0;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-base);
  flex: none; overflow-x: auto;
}
.yu-switch-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: 0; background: 0; font: inherit; font-size: 12.5px;
  color: var(--dsw-alias-label-secondary);
  padding: 8px 12px 9px; cursor: pointer; white-space: nowrap;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  border-radius: 7px 7px 0 0;
  transition: color .14s ease, background .14s ease;
}
.yu-switch-btn:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-1); }
.yu-switch-btn[aria-selected="true"] {
  color: var(--dsw-alias-label-primary); font-weight: 600;
  border-bottom-color: var(--dsw-alias-brand-primary);
}
.yu-view { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
.yu-view > .yc-root { flex: 1 1 auto; min-height: 0; }

/* ---------- 个人中心（面板内嵌） ---------- */
.ym-head { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 16px; }
.ym-avatar { width: 56px; height: 56px; border-radius: 16px; object-fit: cover; border: 1px solid var(--dsw-alias-border-l1); }
.ym-avatar-empty { display: grid; place-items: center; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary); }
.ym-who { min-width: 0; }
.ym-pills { margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; }
.ym-pill {
  display: inline-flex; align-items: center; height: 26px; padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px;
  background: var(--dsw-alias-bg-layer-1); font-size: 11.5px;
  color: var(--dsw-alias-label-secondary); white-space: nowrap;
}
.ym-pill.ok { color: var(--dsw-alias-label-primary); border-color: color-mix(in srgb, #34c759 45%, var(--dsw-alias-border-l1)); }
.ym-pill.bad { color: #d64545; border-color: color-mix(in srgb, #d64545 45%, var(--dsw-alias-border-l1)); }

.ym-tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--dsw-alias-border-l1); margin-bottom: 16px; overflow-x: auto; }
.ym-tab {
  border: 0; background: 0; font: inherit; font-size: 13px; color: var(--dsw-alias-label-secondary);
  padding: 9px 13px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap;
}
.ym-tab:hover { color: var(--dsw-alias-label-primary); }
.ym-tab[aria-selected="true"] { color: var(--dsw-alias-label-primary); font-weight: 600; border-bottom-color: var(--dsw-alias-brand-primary); }

.ym-stack { display: flex; flex-direction: column; gap: 14px; }
.ym-cols { display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 14px; align-items: start; }
.ym-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.ym-stat {
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1); padding: 10px 13px; min-width: 0;
}
.ym-stat b { display: block; font-size: 19px; line-height: 1.25; font-variant-numeric: tabular-nums; }
.ym-stat span { font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
.ym-stat em { display: block; font-style: normal; font-size: 11px; color: var(--dsw-alias-label-secondary); opacity: .8; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; }

.ym-card { border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); padding: 13px 15px 14px; }
.ym-card-title { margin: 0 0 4px; font-size: 13.5px; font-weight: 620; display: flex; align-items: center; gap: 8px; }
.ym-card-hint { margin: 0 0 10px; font-size: 11.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }

.ym-kv { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; }
.ym-kv-row { display: grid; grid-template-columns: 76px 1fr; gap: 10px; align-items: start; }
.ym-k { color: var(--dsw-alias-label-secondary); }
.ym-v { min-width: 0; word-break: break-word; }

.ym-chart { display: flex; align-items: flex-end; gap: 3px; height: 92px; }
.ym-bar { flex: 1 1 auto; border-radius: 3px 3px 1px 1px; background: var(--dsw-alias-brand-primary); opacity: .85; min-height: 2px; }
.ym-bar.zero { background: var(--dsw-alias-border-l1); opacity: 1; }
.ym-bar:hover { opacity: 1; }

.ym-chips { display: flex; gap: 7px; flex-wrap: wrap; }
.ym-chip { font-size: 11.5px; padding: 4px 9px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary); }
.ym-chip b { color: var(--dsw-alias-label-primary); font-variant-numeric: tabular-nums; }

.ym-proj {
  margin: 0; padding: 10px 12px; border-radius: 9px; background: var(--dsw-alias-bg-base);
  border: 1px solid var(--dsw-alias-border-l1); font-size: 12px; line-height: 1.7;
  white-space: pre-wrap; word-break: break-word; max-height: 260px; overflow: auto;
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
}

.ym-mems { display: flex; flex-direction: column; gap: 8px; max-height: 460px; overflow: auto; }
.ym-mem { border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px; background: var(--dsw-alias-bg-base); padding: 9px 11px; }
.ym-mem-top { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.ym-mem-gist { font-size: 12.5px; }
.ym-mem-when { margin-left: auto; font-size: 11px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
.ym-mem-why { font-size: 11.5px; color: var(--dsw-alias-label-secondary); margin-top: 3px; line-height: 1.5; }
.ym-badge {
  font-size: 10.5px; padding: 1px 7px; border-radius: 999px; white-space: nowrap;
  border: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary);
}
.ym-badge.insight { color: var(--dsw-alias-brand-primary); border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, var(--dsw-alias-border-l1)); }
.ym-badge.correction { color: #d64545; border-color: color-mix(in srgb, #d64545 45%, var(--dsw-alias-border-l1)); }
.ym-badge.preference { color: #c98a1b; border-color: color-mix(in srgb, #c98a1b 45%, var(--dsw-alias-border-l1)); }

.ym-docs { display: flex; flex-direction: column; gap: 6px; }
.ym-acc { border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px; overflow: hidden; background: var(--dsw-alias-bg-base); }
.ym-acc summary { cursor: pointer; padding: 8px 11px; font-size: 12.5px; list-style: none; }
.ym-acc summary::-webkit-details-marker { display: none; }
.ym-acc summary::before { content: '▸ '; color: var(--dsw-alias-brand-primary); }
.ym-acc[open] summary::before { content: '▾ '; }
.ym-acc-body { padding: 9px 11px; border-top: 1px solid var(--dsw-alias-border-l1); font-size: 12.5px; line-height: 1.7; white-space: pre-wrap; word-break: break-word; }

.ym-files { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.ym-file { border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px; padding: 9px 11px; background: var(--dsw-alias-bg-base); }
.ym-file b { display: block; font-size: 12.5px; }
.ym-file span { display: block; font-size: 11.5px; color: var(--dsw-alias-label-secondary); margin-top: 2px; }
.ym-file em { display: block; font-style: normal; font-size: 11px; color: var(--dsw-alias-label-secondary); opacity: .75; }

.ym-caps { display: flex; flex-direction: column; gap: 5px; }
.ym-cap { display: flex; gap: 8px; font-size: 12.5px; line-height: 1.5; align-items: flex-start; }
.ym-cap-mk { flex: none; width: 16px; color: var(--dsw-alias-label-secondary); }
.ym-cap.done .ym-cap-mk { color: #34c759; }
.ym-cap.todo .ym-cap-mk { color: #c98a1b; }

.ym-table-wrap { overflow-x: auto; }
.ym-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.ym-table th, .ym-table td { text-align: left; padding: 6px 9px; border-bottom: 1px solid var(--dsw-alias-border-l1); white-space: nowrap; }
.ym-table th { font-size: 11px; color: var(--dsw-alias-label-secondary); font-weight: 600; }
.ym-table td.n { text-align: right; font-variant-numeric: tabular-nums; }
.ym-table tbody tr:hover { background: var(--dsw-alias-bg-layer-2); }

.ym-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.ym-field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
.ym-field-label { color: var(--dsw-alias-label-secondary); }
.ym-field-hint { font-size: 11px; color: var(--dsw-alias-label-secondary); opacity: .8; }
.ym-field input[type="text"], .ym-field input[type="number"], .ym-field textarea {
  width: 100%; padding: 7px 9px; font: inherit; font-size: 12.5px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;
  background: var(--dsw-alias-bg-base); color: inherit; outline: none;
}
.ym-field input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--dsw-alias-brand-primary); }
.ym-field input:focus, .ym-field textarea:focus { border-color: var(--dsw-alias-brand-primary); }
.ym-field textarea { resize: vertical; font-family: ui-monospace, "Cascadia Code", Consolas, monospace; line-height: 1.6; }
.ym-actions { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.ym-msg { font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
.ym-warn { margin: 0 0 12px; font-size: 12px; color: #d64545; }
.ym-empty { margin: 0; font-size: 12px; color: var(--dsw-alias-label-secondary); }

@media (max-width: 860px) {
  .ym-cols, .ym-fields { grid-template-columns: 1fr; }
  .ym-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ym-files { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .yc-page { padding: 18px 16px 72px; }
  .yc-grid { grid-template-columns: 1fr; }
  .yc-row { grid-template-columns: 48px minmax(0, 1fr); }
  .yc-row-time { display: none; }
  .yc-thumb-sm { width: 48px; height: 27px; }
  .yc-detail { margin-left: 58px; }
  .yc-thumbs { grid-template-columns: repeat(auto-fill, minmax(108px, 1fr)); }
  .yc-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) {
  .yc-card, .yc-btn, .yc-search input { transition: none; }
  .yc-card:hover { transform: none; }
}
`;

    return {
      inject: ['slots'],
      apply(ctx) {
        const locale = ctx.get('locale');
        shared.locale = locale || null;
        shared.t = buildT(locale);

        ctx.effect(function () {
          if (!locale) return;
          const disposers = [];
          try {
            disposers.push(locale.register(NS, 'en', TEXTS.en));
          } catch (error) {
            /* 重复注册在热重载时无副作用 */
          }
          try {
            disposers.push(locale.register(NS, 'zh', TEXTS.zh));
          } catch (error) {
            /* 同上 */
          }
          const off = locale.subscribe(function () {
            shared.listeners.forEach(function (listener) {
              listener();
            });
          });
          return function () {
            off();
            disposers.forEach(function (dispose) {
              try {
                dispose();
              } catch (error) {
                /* 已释放 */
              }
            });
          };
        });

        ctx.slots.inject('sidebar.panellist', function () {
          return ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: 'yu-comments',
              order: 21,
              label: function () {
                return shared.t('panel.label');
              },
            },
            FishSidebarIcon,
          );
        });

        ctx.slots.inject('main', function () {
          return ctx.slots.register({ name: 'main', key: 'yu-comments' }, Shell);
        });
      },
    };
  },
});
