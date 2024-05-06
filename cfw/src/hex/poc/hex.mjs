import { configure, log, watchMovie, } from './util.mjs' // {{{1
import { startDemo, } from './poc.mjs'

let service = { // {{{1
  description: 'Stellar Help Exchange',
  svcName: 'SVC_NAME',
  svcPK: 'SVC_PK',
}
let user = {
  guestId: GUEST_ID,
  guestUseSvcUrl: 'GUEST_USE_SVC_URL',
  position: { lat: LATITUDE, lng: LONGITUDE },
  wsUserURL: 'WS_USER_URL',
}

let vm = { // {{{1
  s: [], 
  e: { log }, 
  c: {
    decoded: [], queue: [], watchMovie 
  }, 
  d: {} 
}
window.vm = vm

configure(user) /*.then(user => user.bindToAgent(service)).
  then(user => user.use(service)).
  then(user => user.close()).
  catch(e => console.error(e))
  */
startDemo.call(vm).then(_ => console.log(vm))
  .catch(e => { throw e })
