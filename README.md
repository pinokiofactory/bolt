# bolt.diy

A Pinokio launcher for [bolt.diy](https://github.com/stackblitz-labs/bolt.diy) - the
prompt-to-app interface that turns a sentence into a working full-stack web app
(React/Remix front end, LLM backend, sandboxed code execution).

The launcher clones the project's `stable` branch into `app/`, compiles it once
with `remix vite:build`, and serves the compiled assets through the project's own
`npm start` script (`wrangler pages dev`).

## How to use

| Menu entry | What it does |
| --- | --- |
| **Install** | Clones `stable` into `app/`, runs `pnpm install`, pins `wrangler@3.57.1`, builds the app and installs the optional litellm virtualenv into `env/`. |
| **Start** | Starts the server. The **Open Web UI** tab only appears once the server has printed its URL, so the page never opens blank. |
| **Getting Started** | The project's own intro page. |
| **Update** | Pulls the launcher and the app, reinstalls, rebuilds. |
| **Reset** | Stops the server, frees `app/` and `env/`, then deletes them. |

API keys are read from `app/.env` (copy `app/.env.example` and fill in the keys you
need: OpenAI, Anthropic, Groq, OpenRouter, Ollama, ...). Restart **Start** after
editing it.

Ports are chosen by wrangler (next free port), so nothing needs configuring. Pinokio
proxies every http endpoint to https automatically:
`http://localhost:<PORT>` -> `https://<PORT>.localhost`.

## Programmatic access

`BASE` below is the origin of the **Open Web UI** link, e.g. `http://127.0.0.1:8787`.

### Health check

```bash
curl "$BASE/api/health"
# {"status":"healthy","timestamp":"2026-10-26T05:30:00.000Z"}
```

```js
const res = await fetch(`${BASE}/api/health`);
console.log(await res.json());
```

```python
import requests
print(requests.get(f"{BASE}/api/health").json())
```

### Available models

Returns the model list of every configured provider.

```bash
curl "$BASE/api/models"
```

```js
const res = await fetch(`${BASE}/api/models`);
const { modelList } = await res.json();
console.log(modelList.map((m) => m.name));
```

```python
import requests
print(requests.get(f"{BASE}/api/models").json()["modelList"])
```

### Chat completion (streamed)

`POST /api/chat` takes the chat `messages` array and streams the answer back.

```bash
curl -N -X POST "$BASE/api/chat" \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [{ "id": "1", "role": "user", "content": "Build a todo app" }],
    "contextOptimization": false,
    "files": {}
  }'
```

```js
const res = await fetch(`${BASE}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ id: '1', role: 'user', content: 'Build a todo app' }],
    contextOptimization: false,
    files: {},
  }),
});
for await (const chunk of res.body) process.stdout.write(chunk);
```

```python
import requests

with requests.post(
    f"{BASE}/api/chat",
    json={
        "messages": [{"id": "1", "role": "user", "content": "Build a todo app"}],
        "contextOptimization": False,
        "files": {},
    },
    stream=True,
) as r:
    for line in r.iter_content(chunk_size=None):
        print(line.decode(), end="")
```

Provider credentials are handed to the server as cookies written by the web UI, so
`/api/chat` and `/api/models` only work with the cookie jar of a browser session
that configured its keys once.

### System endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/system/app-info` | GET | App/version information |
| `/api/system/memory-info` | GET | Host memory usage |
| `/api/system/disk-info` | GET | Disk usage |
| `/api/system/process-info` | GET | Process list |
| `/api/system/git-info?action=getUser` | GET | GitHub user (`Authorization: Bearer <token>` also accepted) |

## Notes

- **Why a production build instead of `npm run dev`:** the vite dev server
  pre-bundles bolt's dependencies only when the browser requests the page for the
  very first time. Opening the page while that bundling is still running replaced
  the chunks vite had already delivered, the app never booted (empty `#root` =
  white page) and only a manual reload brought it back. A production build has no
  optimizer left to race with, so the first page load is complete.
- **Why `CI=true`:** wrangler's interactive session UI redraws itself with cursor
  control sequences, which Pinokio's event matcher cannot read, so the
  `Ready on ...` line would never be captured and the Open Web UI tab would never
  appear. `CI` switches wrangler to plain line output while leaving the project's
  start script intact.
- **Build fallback:** if `app/build` is missing (older install, wiped build
  folder), `start.js` compiles before starting. Its output goes to
  `app/.build.log` on purpose: vite's progress output rewrites itself in place with
  cursor control sequences, and while that stream is scrolling Pinokio never sees
  the command finish, so the step would hang forever. With a quiet terminal the
  step completes and the launcher moves on to `npm start`. The first start after an
  install takes roughly 30-40 seconds because of that compile. `install.js` and
  `update.js` run their build the same way (same log file, same marker
  `BUILD_FAILED_siehe_app_.build.log` on failure), so those steps cannot hang
  either - unredirected build output used to leave Pinokio waiting for a command
  that had already finished.
- **Reset and locked folders:** Windows refuses to delete (or rename) a folder
  while any process still has it open, and the dev server keeps `app/` open as its
  working directory. `reset.js` therefore stops `start.js`, terminates every
  process whose command line still references `app/` or `env/` (both `\` and `/`
  path forms are matched) and waits until both folders are provably free before
  `fs.rm` runs. If something else still holds them - typically an editor (VS Code
  keeps `app/.git` open), an indexer or an antivirus scanner - reset lists the
  processes it can see, explains the situation, **deletes nothing** and ends
  cleanly instead of hanging. Close that program and run Reset again. That
  unlocking logic itself lives in `reset.helpers.js`, so `reset.js` stays a
  plain list of Pinokio steps.
- **Optional litellm step:** the first step of `start.js` launches
  `litellm --config config.yaml` when `OPENAI_API_KEY` is set in Pinokio's
  environment. It is skipped otherwise, which is the default.
- On Windows a running dev server keeps `app/` open (it uses the folder as its
  working directory), which is why Reset used to fail until Pinokio was closed.
