// bolt.diy is compiled to static assets during install (remix vite:build) and
// then served by the project's own `npm start` script (wrangler pages dev).
//
// 1. Why not `npm run dev`: the vite dev server pre-bundles bolt's
//    dependencies only when the browser requests the page for the very first
//    time. Opening the page while that bundling is still running replaced the
//    chunks vite had already delivered, the app never booted (empty #root =
//    white page) and only a manual reload brought it back. A production build
//    has no optimizer left to race with, so the first page load is complete.
//
// 2. Why CI=true: wrangler's interactive session UI redraws itself with
//    cursor control sequences, which Pinokio's event matcher cannot read, so
//    the "Ready on ..." line would never be captured and the Open Web UI tab
//    would never appear. CI switches wrangler to plain line output while
//    leaving the project's start script (including the unix bindings) intact.
module.exports = {
  daemon: true,
  run: [
    {
      when: "{{env.OPENAI_API_KEY}}",
      method: "shell.run",
      params: {
        venv: "env",
        //message: "litellm --model github/gpt-4o",
        message: "litellm --config config.yaml",
        on: [{
          event: "/(http:\\/\\/[0-9.:]+)/",
          done: true
        }]
      }
    },
    {
      // Safety net for installs that predate the build step in install.js
      // (or a wiped build folder): compile before starting instead of failing.
      // The output is redirected to app/.build.log on purpose: vite's progress
      // output rewrites itself in place with cursor control sequences, and while
      // that stream is scrolling Pinokio never sees the command finish, so the
      // script would hang here forever. With a quiet terminal the step completes
      // and the launcher moves on to npm start.
      when: "{{!exists('app/build')}}",
      method: "shell.run",
      params: {
        path: "app",
        message: [
          "npm run build > .build.log 2>&1 || echo BUILD_FAILED_siehe_app_.build.log"
        ]
      }
    },
    {
      method: "shell.run",
      params: {
        env: {
          CI: "true"
        },
        path: "app",
        message: [
          "npm start"
        ],
        on: [{
          // capture the local server url
          event: "/(http:\\/\\/[0-9.:]+)/",
          done: true
        }]
      }
    },
    {
      // This step sets the local variable 'url'.
      // This local variable will be used in pinokio.js to display the "Open WebUI" tab when the value is set.
      method: "local.set",
      params: {
        // the input.event is the regular expression match object from the previous step
        url: "{{input.event[1]}}"
      }
    },
  ]
}
