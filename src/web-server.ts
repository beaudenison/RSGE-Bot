import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";
import { GeApiService } from "./services/ge-api";
import { ItemSearchService } from "./services/item-search";
import {
  formatPrice,
  formatRelativeTime,
  formatSignedChange,
} from "./utils/format-price";

const defaultUserAgent =
  "RSGE-Bot/1.0 (+https://github.com/beaudenison/RSGE-Bot)";
const port = Number.parseInt(process.env.WEB_PORT || "3000", 10);

const geApiService = new GeApiService(process.env.RS_USER_AGENT || defaultUserAgent);
const itemSearchService = new ItemSearchService(geApiService);

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown
): void {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function htmlPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RSGE Search</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0b1220;
      --panel: #111b2e;
      --panel-2: #17233a;
      --text: #e7edf7;
      --muted: #9db0cd;
      --line: #283652;
      --good: #22c55e;
      --bad: #ef4444;
      --neutral: #94a3b8;
      --accent: #60a5fa;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Segoe UI, Roboto, Arial, sans-serif;
      background: radial-gradient(circle at top, #172742 0%, var(--bg) 45%);
      color: var(--text);
      min-height: 100vh;
    }
    .wrap {
      width: min(980px, 92vw);
      margin: 56px auto;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 2rem;
      letter-spacing: 0.2px;
    }
    .sub {
      margin: 0 0 20px;
      color: var(--muted);
    }
    .search {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      margin-bottom: 16px;
    }
    input {
      width: 100%;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 12px;
      color: var(--text);
      padding: 14px;
      font-size: 1rem;
      outline: none;
    }
    input:focus { border-color: var(--accent); }
    button {
      border: 1px solid #3b82f6;
      background: linear-gradient(180deg, #3b82f6, #2563eb);
      color: white;
      font-weight: 600;
      padding: 0 20px;
      border-radius: 12px;
      cursor: pointer;
    }
    button:disabled { opacity: 0.7; cursor: not-allowed; }
    .card {
      background: linear-gradient(180deg, var(--panel), var(--panel-2));
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 16px;
    }
    .hidden { display: none; }
    .muted { color: var(--muted); }
    .top {
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: 14px;
      align-items: center;
      margin-bottom: 14px;
    }
    .icon {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      background: #0b1323;
      border: 1px solid var(--line);
      object-fit: contain;
      padding: 6px;
    }
    .title {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .pill {
      padding: 4px 10px;
      border: 1px solid var(--line);
      border-radius: 999px;
      font-size: 0.85rem;
      color: var(--muted);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
      margin-top: 12px;
    }
    .block {
      border: 1px solid var(--line);
      background: rgba(8, 14, 25, 0.35);
      border-radius: 12px;
      padding: 12px;
    }
    .k { color: var(--muted); font-size: 0.85rem; margin-bottom: 5px; }
    .v { font-size: 1.02rem; font-weight: 600; }
    .good { color: var(--good); }
    .bad { color: var(--bad); }
    .neutral { color: var(--neutral); }
    .alts { margin-top: 14px; color: var(--muted); font-size: 0.95rem; }
    .alts span {
      display: inline-block;
      margin: 2px 6px 2px 0;
      padding: 4px 8px;
      border: 1px solid var(--line);
      border-radius: 999px;
    }
    a { color: #93c5fd; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <main class="wrap">
    <h1>RSGE Search</h1>
    <p class="sub">Search RuneScape 3 GE items with the same data source as your Discord bot.</p>
    <form id="form" class="search">
      <input id="query" type="text" placeholder="Search an item (e.g. abyssal whip)" autocomplete="off" required />
      <button id="submit" type="submit">Search</button>
    </form>

    <section id="status" class="muted">Ready.</section>

    <section id="result" class="card hidden" aria-live="polite">
      <div class="top">
        <img id="icon" class="icon" alt="Item icon" />
        <div>
          <div class="title">
            <h2 id="name" style="margin:0;"></h2>
            <span id="members" class="pill"></span>
            <span id="type" class="pill"></span>
          </div>
          <p id="desc" class="muted" style="margin:8px 0 0;"></p>
          <a id="link" target="_blank" rel="noreferrer">Open in RuneScape ItemDB</a>
        </div>
      </div>

      <div class="grid">
        <div class="block">
          <div class="k">Current GE</div>
          <div id="current" class="v"></div>
        </div>
        <div class="block">
          <div class="k">Today</div>
          <div id="today" class="v"></div>
        </div>
        <div class="block">
          <div class="k">30d / 90d / 180d</div>
          <div id="trends" class="v"></div>
        </div>
        <div class="block">
          <div class="k">Realtime Market</div>
          <div id="realtime" class="v"></div>
        </div>
      </div>

      <div id="alts" class="alts"></div>
    </section>
  </main>

  <script>
    const form = document.getElementById('form');
    const queryEl = document.getElementById('query');
    const submit = document.getElementById('submit');
    const status = document.getElementById('status');
    const result = document.getElementById('result');

    const icon = document.getElementById('icon');
    const nameEl = document.getElementById('name');
    const members = document.getElementById('members');
    const type = document.getElementById('type');
    const desc = document.getElementById('desc');
    const link = document.getElementById('link');
    const current = document.getElementById('current');
    const today = document.getElementById('today');
    const trends = document.getElementById('trends');
    const realtime = document.getElementById('realtime');
    const alts = document.getElementById('alts');

    function trendClass(v) {
      if (!v) return 'neutral';
      if (v.includes('+') || v.includes('positive')) return 'good';
      if (v.includes('-') || v.includes('negative')) return 'bad';
      return 'neutral';
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const q = queryEl.value.trim();
      if (!q) return;

      submit.disabled = true;
      status.textContent = 'Searching...';
      result.classList.add('hidden');

      try {
        const res = await fetch('/api/search?q=' + encodeURIComponent(q));
        const data = await res.json();

        if (!res.ok) {
          status.textContent = data.error || 'Search failed.';
          return;
        }

        status.textContent = 'Found item.';
        result.classList.remove('hidden');

        icon.src = data.item.iconLarge;
        icon.alt = data.item.name;
        nameEl.textContent = data.item.name + ' (#' + data.item.id + ')';
        members.textContent = data.item.members ? 'Members' : 'Free';
        type.textContent = data.item.type;
        desc.textContent = data.item.description;
        link.href = data.item.url;

        current.className = 'v ' + trendClass(data.item.current.trend);
        current.textContent = data.item.current.price;

        today.className = 'v ' + trendClass(data.item.today.trend);
        today.textContent = data.item.today.change;

        trends.innerHTML =
          '<span class="' + trendClass(data.item.trends.day30.trend) + '">30d ' + data.item.trends.day30.change + '</span> · ' +
          '<span class="' + trendClass(data.item.trends.day90.trend) + '">90d ' + data.item.trends.day90.change + '</span> · ' +
          '<span class="' + trendClass(data.item.trends.day180.trend) + '">180d ' + data.item.trends.day180.change + '</span>';

        if (data.realtime) {
          realtime.textContent = data.realtime.price + ' | Vol ' + data.realtime.volume + ' | ' + data.realtime.updated;
        } else {
          realtime.textContent = 'No realtime trade data available.';
        }

        if (data.alternatives.length > 0) {
          alts.innerHTML = 'Closest matches: ' + data.alternatives.map((x) => '<span>' + x.name + ' (#' + x.id + ')</span>').join('');
        } else {
          alts.textContent = '';
        }
      } catch (error) {
        status.textContent = 'Search failed. Try again.';
      } finally {
        submit.disabled = false;
      }
    });
  </script>
</body>
</html>`;
}

function formatSearchResult(result: Awaited<ReturnType<ItemSearchService["search"]>>) {
  if (!result) {
    return null;
  }

  const itemUrl = `https://services.runescape.com/m=itemdb_rs/viewitem?obj=${result.item.id}`;

  return {
    item: {
      id: result.item.id,
      name: result.item.name,
      description: result.item.description,
      type: result.item.type,
      members: result.item.members.toLowerCase() === "true",
      iconLarge: result.item.icon_large,
      url: itemUrl,
      current: {
        trend: result.item.current.trend,
        price: formatPrice(result.item.current.price),
      },
      today: {
        trend: result.item.today.trend,
        change: formatSignedChange(result.item.today.price),
      },
      trends: {
        day30: {
          trend: result.item.day30.trend,
          change: result.item.day30.change,
        },
        day90: {
          trend: result.item.day90.trend,
          change: result.item.day90.change,
        },
        day180: {
          trend: result.item.day180.trend,
          change: result.item.day180.change,
        },
      },
    },
    realtime: result.realtime
      ? {
          price: formatPrice(result.realtime.price),
          volume: result.realtime.volume.toLocaleString(),
          updated: formatRelativeTime(result.realtime.timestamp),
        }
      : null,
    alternatives: result.alternatives.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
    })),
  };
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const method = request.method || "GET";
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (method === "GET" && url.pathname === "/") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(htmlPage());
    return;
  }

  if (method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (method === "GET" && url.pathname === "/api/search") {
    const query = (url.searchParams.get("q") || "").trim();

    if (!query) {
      sendJson(response, 400, { error: "Missing query. Use ?q=<item name>." });
      return;
    }

    try {
      const searchResult = await itemSearchService.search(query);
      if (!searchResult) {
        sendJson(response, 404, {
          error: `No RuneScape 3 GE item found for ${query}.`,
        });
        return;
      }

      sendJson(response, 200, formatSearchResult(searchResult));
      return;
    } catch (error) {
      console.error("Web search request failed", error);
      sendJson(response, 500, { error: "Unable to fetch item data right now." });
      return;
    }
  }

  sendJson(response, 404, { error: "Not found." });
}

const server = createServer((request, response) => {
  void handleRequest(request, response);
});

server.listen(port, () => {
  console.log(`RSGE web interface listening on port ${port}`);
});
