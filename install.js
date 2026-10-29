module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        message: [
          "git clone -b stable https://github.com/stackblitz-labs/bolt.diy app",
        ]
      }
    },
    {
      method: "shell.run",
      params: {
        path: "app",
        message: [
          "pnpm install",
          "pnpm install wrangler@4.153.0",
          // redirected to app/.build.log: while vite's progress stream rewrites
          // itself in place, Pinokio never sees the command finish and the
          // install would hang here (same reason as in start.js / update.js)
          "pnpm run build > .build.log 2>&1 || echo BUILD_FAILED_siehe_app_.build.log"
        ]
      }
    },
    {
      method: "shell.run",
      params: {
        venv: "env",
        message: "uv pip install litellm[proxy]==1.57.4"
      }
    }
  ]
}
