import { markAgent, setup, } from './util.mjs' // {{{1

let agent

window.addEventListener('message', e => { // {{{1
  console.log(e.data, typeof e.data[0])
  if (typeof e.data[0] == 'string') {
    if (!agent) {
      agent = markAgent(e.data)
    }
    return;
  }
  setup({ lat: e.data[0], lng: e.data[1] }, e.data[2])
})
window.opener.postMessage('user-url started', window.opener.location)
