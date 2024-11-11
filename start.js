module.exports = {
  daemon: true,
  run: [
    {
      when: "{{process.env.OPENAI_API_KEY}}",
      method: "shell.run",
      params: {
        venv: "env",
        //message: "litellm --model github/gpt-4o",
        message: "litellm --config config.yaml",
        on: [{
          // The regular expression pattern to monitor.
          // When this pattern occurs in the shell terminal, the shell will return,
          // and the script will go onto the next step.
          "event": "/http:\/\/\\S+/",   

          // "done": true will move to the next step while keeping the shell alive.
          // "kill": true will move to the next step after killing the shell.
          "done": true
        }]
      }
    },
    {
      method: "shell.run",
      params: {
        env: { },                   // Edit this to customize environment variables (see documentation)
        path: "app",                // Edit this to customize the path to start the shell from
        message: [
          "npm run dev"
        ],
        on: [{
          // The regular expression pattern to monitor.
          // When this pattern occurs in the shell terminal, the shell will return,
          // and the script will go onto the next step.
          "event": "/http:\/\/\\S+/",   

          // "done": true will move to the next step while keeping the shell alive.
          // "kill": true will move to the next step after killing the shell.
          "done": true
        }]
      }
    },
    {
      // This step sets the local variable 'url'.
      // This local variable will be used in pinokio.js to display the "Open WebUI" tab when the value is set.
      method: "local.set",
      params: {
        // the input.event is the regular expression match object from the previous step
        url: "{{input.event[0]}}"
      }
    },
  ]
}
