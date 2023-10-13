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
  bound.postMessage('roger', e.origin)
  for (let i = 1; i < 11; i++) {
    ws.send('["roger that ' + i + '"]')
  }
}) // }}}1

loop()

async function loop () { // {{{1
  while (goon) {
    let ok, notok, promise = new Promise((g, b) => { ok = g; notok = b; })
    ws = new WebSocket('XXXX')
    ws.onerror = e => {
      notok(e)
      console.error(e)
    }
    ws.onclose = a => { // { isTrusted: true }
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
    ws.onopen = data => {
      log('connected')
    }
    ws.onmessage = m => {
      log(m.data)
      m.data == '{"signal":"unbound"}' && buttonStop.click()
      if (m.data.indexOf(' bound ') > 0) {
        bound = window.open('BOUND', '_blank'); return;
      }
      let jsoa
      try {
        jsoa = JSON.parse(m.data)
        bound.postMessage(jsoa, boundOrigin)
      } catch(e) {}
    }
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

