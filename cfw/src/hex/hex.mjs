import { configure, log, visitHEX, } from './util.mjs' // {{{1
import {
  HEX_FEE, dealOffer, dealRequest, description, dog2hexa, hexa2dog,
  makeOffer, makeRequest, parseHEXA, reclaim, repayOffer, repayRequest,
  takeOffer, takeRequest,
} from '../../../hex/lib/api.mjs'
import {
  convertClawableHexa,
  createAccount, makeBuyOffer, makeSellOffer, memo2str,
  secdVm, storeKeys, trustAssets, updateTrustline,
} from '../../../hex/lib/sdk.mjs'
import {
  MemoText,
} from '@stellar/stellar-sdk'
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
let initVm = async _ => await secdVm(
  [null, config.HEX_Issuer_PK], // keysIssuer
  null,                         // keysAgent
  console.log,                  // log
  '1000000',                    // limit
  config.nw == 'public'         // PUBLIC
).then(vm => {
  window.vm = vm
  vm.e.log(vm, user)
  vm.s.push({ tag: "issuer's effects",
    close: vm.e.server.effects().forAccount(vm.d.issuer.id).stream({
      onerror:   e => { throw e; },
      onmessage: e => {
        if (e.type != 'claimable_balance_claimant_created') {
          return;
        }
        onIssuerEffect.call(vm, e)
      }
    })
  })
})
initVm()

configure(user).then(user => user.bindToAgent(service)). // {{{1
  then(user => user.use(service)).
  then(user => user.close()).catch(e => console.error(e))

/*startDemo.call(vm).then(_ => console.log(vm))
  .catch(e => { throw e })
  */

async function onIssuerEffect (effect) { // {{{1
  let { s, e, c, d } = this, tx, agentPK, desc, amount
  await effect.operation().then(op => op.transaction())
  .then(t => (tx = t).operations()).then(ops => {
    if (tx.memo_type != MemoText) { // not a make, a takeOffer effect
      return;
    }
    agentPK = ops.records[0].source_account
    desc = description(ops)
    amount = parseHEXA(desc)
    if (tx.memo.startsWith('Offer')) {
    } else {
    }
  }).catch(e => { throw e; })
  if (d.agent) {
  } else {
    d.keysAgent = [null, agentPK]
    d.agent = await e.server.loadAccount(agentPK)
  }
  e.log(tx.memo, desc, amount)
}
