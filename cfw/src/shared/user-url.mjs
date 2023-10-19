import { setup, } from './util.mjs' // {{{1

window.addEventListener('message', e => { // {{{1
  e.data.forEach(e => console.log(e))
})
window.opener.postMessage('user-url started', window.opener.location)

setup() // {{{1
