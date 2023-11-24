class WsConnection {
  async #loop () { // {{{1
    this.isOn = true
    while (this.isOn) {
      let ok, notok, promise = new Promise((g, b) => { ok = g; notok = b; })
      let ws = new WebSocket(this.user.wsUserURL)
      ws.onerror = e => {
        notok(e)
        console.error(e)
      }
      ws.onclose = a => {
        console.log('ws.onclose: disconnected')
        if (typeof a == 'object') {
          this.isOn = false
          this.user.closing(this.user)
          ok()
        }
        this.isOn && setTimeout(_ => {
          console.log('reconnecting...') || console.log('done.')
          ok()
        }, 5000)
      }
      ws.onopen = data => {
        console.log('connected')
      }
      ws.onmessage = m => {
        console.log(m.data)
        if (m.data.indexOf('binding') > 0 || m.data.indexOf('disconnected') > 0) {
          return;
        }
        if (m.data.indexOf(' bound ') > 0) {
          this.user.boundToAgent(+m.data.split(' ')[5])
          return;
        }
        let jsoa
        try {
          jsoa = JSON.parse(m.data)
        } catch(e) { console.log(e, jsoa, m.data) }
      }
      await promise.catch(e => console.error(e))
    }
    console.log('stopped.')
  }
  constructor (user) { // {{{1
    this.user = user
    user.wsConnection = this
    this.#loop()
  } // }}}1
}

export { WsConnection, }
