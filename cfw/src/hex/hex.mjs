import { configure, log, visitHEX, } from './util.mjs' // {{{1
import {
  HEX_FEE, dealOffer, dealRequest, description, dog2hexa, hexa2dog,
  makeOffer, makeRequest, parseHEXA, reclaim, repayOffer, repayRequest,
  takeOffer, takeRequest,
} from '../../../hex/lib/api.mjs'
import {
  convertClawableHexa,
  createAccount, makeBuyOffer, makeSellOffer, memo2str,
  storeKeys, trustAssets, updateTrustline,
} from '../../../hex/lib/sdk.mjs'
//import json from '../../../../../hex/user/prod/config/f_add_hex_makes.json'
//console.log(json)

/* Mapping JS code imports to vim tabs and splits, example: {{{1

 this.mjs ---> api.mjs
         \        |
          \       | 
           \      V  
            -> sdk.mjs

      maps to

|     tab 1      |    tab 2      |
|        |api.mjs|       |       |
|this.mjs|-------|api.mjs|sdk.mjs|
|        |sdk.mjs|       |       |
*/

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

let config = { // {{{1
  HEX_Issuer_PK: 'STELLAR_HEX_ISSUER_PK',
  nw: 'STELLAR_NETWORK',
}
console.log(config)

let vm = { // {{{1
  s: [], 
  e: { log }, 
  c: {
    decoded: [], queue: [], visitHEX 
  }, 
  d: {} 
}
window.vm = vm

configure(user) /*.then(user => user.bindToAgent(service)).
  then(user => user.use(service)).
  then(user => user.close()).
  catch(e => console.error(e))
startDemo.call(vm).then(_ => console.log(vm))
  .catch(e => { throw e })
  */
