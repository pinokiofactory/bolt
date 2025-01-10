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
      message: "npm install"
    }
  }, {
    method: "shell.run",
    params: {
      venv: "env",
      message: "pip install litellm[proxy]==1.57.4"
    }
  }, {
    method: "fs.link",
    params: {
      venv: "env"
    }
  }]
}
