module.exports = {
  run: [
    {
      when: "{{running('start.js')}}",
      method: "script.stop",
      params: {
        uri: "start.js"
      }
    },
    {
      when: "{{exists('app')}}",
      method: "fs.rm",
      params: {
        path: "app"
      }
    },
    {
      when: "{{exists('env')}}",
      method: "fs.rm",
      params: {
        path: "env"
      }
    },
    {
      method: "log",
      params: {
        raw: "reset finished."
      }
    }
  ]
}
