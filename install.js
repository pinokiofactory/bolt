module.exports = {
  run: [
    // Edit this step to customize the git repository to use
    {
      method: "shell.run",
      params: {
        message: [
          "git clone -b stable https://github.com/stackblitz-labs/bolt.diy app",
        ]
      }
    },
    // Edit this step with your custom install commands
    {
      method: "shell.run",
      params: {
        path: "app",                // Edit this to customize the path to start the shell from
        message: [
          "pnpm install",
          "pnpm install wrangler@3.57.1"
        ]
      }
    },
    {
      method: "shell.run",
      params: {
        venv: "env",
        message: "uv pip install litellm[proxy]==1.57.4"
      }
    },
    {
      method: "fs.link",
      params: {
        venv: "env"
      }
    }
  ]
}
