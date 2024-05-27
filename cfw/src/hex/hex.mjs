import { configure, } from './util.mjs' // {{{1

import { Codec, Model, View, } from '../../../lib/mvc.mjs' // {{{1
import * as kit from '../../../hex/lib/kit.mjs'
//import json from '../../../../../hex/user/prod/config/f_add_hex_makes.json'
//console.log(json)

/* Mapping JS code imports to vim tabs and splits, example: {{{1

 this.mjs ---> kit.mjs ---> api.mjs
                  |        /
                  |       /
                  V      /
               sdk.mjs <-

      maps to FIXME

|     tab 1      |    tab 2      |
|        |api.mjs|       |       |
|this.mjs|-------|api.mjs|sdk.mjs|
|        |sdk.mjs|       |       |
*/

let service = { // {{{1
  description: 'Stellar Help Exchange',
  svcName: 'SVC_NAME', // replace in $DAK_HOME/svc/hex/cfw/src/util.mjs
  svcPK: 'SVC_PK',
}
let user = {
  guestId: GUEST_ID, // replace in $DAK_HOME/svc/hex/cfw/src/util.mjs ////
  guestUseSvcUrl: 'GUEST_USE_SVC_URL',                                  //
  position: { lat: LATITUDE, lng: LONGITUDE },                          //
  wsUserURL: 'WS_USER_URL', // r=$DAK_HOME/svc/hex/cfw/src/util.mjs //////
}
let config = { 
  HEX_Issuer_PK: 'STELLAR_HEX_ISSUER_PK', // replace in $r ////
  nw: 'STELLAR_NETWORK',                                     //
  kit,
}
kit.initVm(config).then(vm => {
  let tXs2map = [], tXs_read = 0
  Object.assign(vm.d, { service, tXs2map, tXs_read, user })
  window.vm = vm
  return Promise.all([Codec.init(vm), Model.init(vm), View.init(vm)]);
}).then(a => {
  const [codec, model, view] = a
  const log = window.vm.e.log
  log(codec, model, view)

}).catch(e => console.error(e)).finally(_ => console.log('MVC DONE'))
/*
configure(user).then(user => user.bindToAgent(service)). // {{{1
  then(user => user.use(service)).
  then(user => user.close()).catch(e => console.error(e)).
  finally(_ => console.log('DONE'))

/*startDemo.call(vm).then(_ => console.log(vm))
  .catch(e => { throw e })
  */
