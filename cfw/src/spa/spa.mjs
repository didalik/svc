import { markup, setup, } from './util.mjs' // {{{1

//let guestId = +window.location.pathname.split('/')[3]

window.addEventListener('message', e => { // {{{1
  console.log(e.data)
  for (let a of e.data) {
    if (typeof a[0] == 'string') {
      markup(a)
    } else if (typeof a[0] == 'number') {
      setup({ lat: a[0], lng: a[1] }, guestId)
    }
  }
})
//window.opener.postMessage('user-url started, guestId ' + guestId, window.opener.location)

setup({ lat: LATITUDE, lng: LONGITUDE }, GUEST_ID)
