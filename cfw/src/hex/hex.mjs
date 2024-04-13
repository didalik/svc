import { configure, watchMovie, } from './util.mjs' // {{{1
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

let vm = { s: [], e: { log: console.log }, c: { watchMovie }, d: {} } // {{{1
window.vm = vm

configure(user) /*.then(user => user.bindToAgent(service)).
  then(user => user.use(service)).
  then(user => user.close()).
  catch(e => console.error(e))
  */
//startDemo.call(vm).then(_ => console.log(vm)).
//  catch(e => { throw e })

