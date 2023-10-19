let ws, bound, boundOrigin // {{{1
let buttonStop = document.getElementById('stop')
let now = Date.now(), p, goon = true

buttonStop.onclick = _ => {
  buttonStop.disabled = true 
  log('stopping...')
  ws.send(JSON.stringify({ request: 'stop' }))
  goon = false 
}
window.addEventListener('message', e => { // {{{1
  log(`e.origin ${e.origin}, e.data ${e.data}`)
  boundOrigin ??= e.origin
  bound.postMessage(['roger'], e.origin)
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
      log(`disconnected typeof a ${typeof a} a?.isTrusted ${a?.isTrusted}`)
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
      if (m.data.indexOf(' bound ') > 0) {
        bound = window.open('BOUND', '_blank'); return;
      }
      let jsoa
      try {
        jsoa = JSON.parse(m.data)
        bound.postMessage(jsoa, boundOrigin)
      } catch(e) { console.error(e) }
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

