import { configure, } from './util.mjs' // {{{1

let service = {
  description: 'An s2cb service example',
  svcName: 'SVC_NAME',
  svcPK: 'SVC_PK',
}
let user = {
  guestId: GUEST_ID,
  guestUseSvcUrl: 'GUEST_USE_SVC_URL',
  position: { lat: LATITUDE, lng: LONGITUDE },
  wsUserURL: 'WS_USER_URL',
}

configure(user).then(user => user.bindToAgent(service)).
  then(user => user.use(service)).
  then(user => user.close()).
  catch(e => console.error(e))
