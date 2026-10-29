module.exports = {
  run: [{
    method: "shell.run",
    params: {
      message: "git pull"
    }
  }, {
    method: "shell.run",
    params: {
      path: "app",
      message: "git pull"
    }
  }, {
    method: "shell.run",
    params: {
      path: "app",
      message: [
        "pnpm install",
        // Build output is redirected to app/.build.log on purpose: vite's
        // progress output rewrites itself in place with cursor control
        // sequences, and while that stream is scrolling Pinokio never sees
        // the command finish, so the update would hang here forever.
        "pnpm run build > .build.log 2>&1 || echo BUILD_FAILED_siehe_app_.build.log"
      ]
    }
  }, {
    method: "shell.run",
    params: {
      venv: "env",
      // uv statt pip - gleicher Befehl wie in install.js (Best Practice: UV
      // ist der bevorzugte Paketmanager fuer Python in Pinokio-Skripten)
      message: "uv pip install litellm[proxy]==1.57.4"
    }
  }]
}
