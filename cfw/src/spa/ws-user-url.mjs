let ws, users, usersOrigin, queue = [] // {{{1
let buttonStop = document.getElementById('stop')
let now = Date.now(), p, goon = true

buttonStop.onclick = _ => {
  buttonStop.disabled = true 
  log('stopping...')
  ws.send(JSON.stringify({ request: 'stop' }))
  goon = false 
}
window.addEventListener('message', e => { // {{{1
  log(`e.origin ${e.origin}, e.data ${e.data}, queue.length ${queue.length}`)
  if (typeof e.data == 'string') {
    usersOrigin = e.origin
  }
  usersOrigin && users.postMessage(queue, usersOrigin) || queue.push(e.data)
})
window.opener.postMessage('ws-user-url started', window.opener.location) // }}}1

loop()

async function loop () { // {{{1
  while (goon) {
    let ok, notok, promise = new Promise((g, b) => { ok = g; notok = b; })
    ws = new WebSocket('XXXX')
    ws.onerror = e => { // {{{2
      notok(e)
      console.error(e)
    }
    ws.onclose = a => { // { isTrusted: true } {{{2
      log('ws.onclose: disconnected')
      if (typeof a == 'object') {
        goon = false
        buttonStop.disabled = true
        ok()
      }
      goon && setTimeout(_ => {
        log('reconnecting...') || log('done.')
        ok()
      }, 5000)
    }
    ws.onopen = data => { // {{{2
      log('connected')
    }
    ws.onmessage = m => { // {{{2
      log(m.data)
      m.data == '{"signal":"unbound"}' && buttonStop.click()
      if (m.data.indexOf('binding') > 0 || m.data.indexOf('disconnected') > 0) {
        return;
      }
      if (m.data.indexOf(' bound ') > 0) {
        users = window.open('BOUND', '_blank')
        let guestId = m.data.split(' ')[2]
        queue[0].push(+guestId)
        ws.send(JSON.stringify(queue[0]))
        console.log('sent', queue[0], 'users', users)
        return;
      }
      let jsoa
      try {
        jsoa = JSON.parse(m.data)
        usersOrigin && users.postMessage([jsoa], usersOrigin) || queue.push(jsoa)
      } catch(e) { console.log(e, jsoa, m.data) }
    } // }}}2
    await promise.catch(e => console.error(e))
  }
  log('stopped.')
}

function log (text) { // {{{1
  p = now; now = Date.now()
  text = '+ ' + (now - p) + ' ms: ' + text
  let l = document.getElementById('log')
  l.appendChild(document.createTextNode(text))
  l.appendChild(document.createElement('br'))
}

