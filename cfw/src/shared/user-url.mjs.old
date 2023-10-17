let ws, bound
let buttonStop = document.getElementById('stop')
let now = Date.now(), p, goon = true
buttonStop.onclick = _ => { // {{{2
  buttonStop.disabled = true 
  log('stopping...')
  goon = false 
}
window.addEventListener('message', e => { // {{{2
  e.data.forEach(e => log(e))
}) // }}}2
window.opener.postMessage(`${window.location} started`, window.opener.location)
log('started')

function log (text) { // {{{2
  p = now; now = Date.now()
  text = '+ ' + (now - p) + ' ms: ' + text
  let l = document.getElementById('log')
  l.appendChild(document.createTextNode(text))
  l.appendChild(document.createElement('br'))
} // }}}2
