import { markup, setup, } from './util.mjs' // {{{1

let guestId = +window.location.pathname.split('/')[3]

window.addEventListener('message', e => { // {{{1
  //console.log(e.data, typeof e.data[0])
  if (typeof e.data[0] == 'string') {
    return markup(e.data);
  }
  setup({ lat: e.data[0], lng: e.data[1] }, guestId)
})
window.opener.postMessage('user-url started, guestId ' + guestId, window.opener.location)
