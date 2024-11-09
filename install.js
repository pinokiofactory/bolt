module.exports = {
  run: [
    // Edit this step to customize the git repository to use
    {
      method: "shell.run",
      params: {
        message: [
          "git clone https://github.com/coleam00/bolt.new-any-llm app",
        ]
      }
    },
    // Edit this step with your custom install commands
    {
      method: "shell.run",
      params: {
        path: "app",                // Edit this to customize the path to start the shell from
        message: [
          "npm install"
        ]
      }
    },
    {
      method: "shell.run",
      params: {
        venv: "env",
        message: "pip install litellm[proxy]"
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
