import { setup, } from './util.mjs' // {{{1

setup() // {{{1

window.addEventListener('message', e => {
  e.data.forEach(e => console.log(e))
})
window.opener.postMessage('user-url started', window.opener.location)
