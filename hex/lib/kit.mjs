/* Copyright (c) 2023-present, Дід Alik and the Kids {{{1
 *
 * This script is licensed under the Apache License, Version 2.0, found in the
 * LICENSE file in the root directory of this source tree.
 * * */

import { description, parseHEXA, HEX_FEE, } from './api.mjs' // {{{1
import { secdVm, } from './sdk.mjs'
import {
  MemoText,
} from '@stellar/stellar-sdk'

const initVm = c => secdVm( // {{{1
  [null, c.HEX_Issuer_PK], // keysIssuer
  null,                    // keysAgent
  console.log,             // log
  '1000000',               // limit
  HEX_FEE,                 // HEX_FEE
  c.nw == 'public',        // PUBLIC
  c.kit                    // kit
).then(vm => {
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
  return Promise.resolve(vm)
})

function initModel () { // {{{1
  // Model is initialized when d.tXs2map holds locations and { desc, memo }
  // for all d.old_tXs_length transactions. A location is an array. A transaction
  // is either
  //           [ txid, [ lng, lat ], { desc, memo } ]
  // or
  //           [ txid, { desc, memo }, [ lng, lat ] ]
  // array.
  let { s, e, c, d } = this
  fetch(d.user.guestUseSvcUrl, { method: 'GET', }).then(response => response.json())
  .then(json => {
    d.old_tXs_length = json.taken.length
    for (let tX of json.taken) {
      tXpush.call(this, tX)
    }
  })
}

async function onIssuerEffect (effect) { // claimable_balance_claimant_created {{{1
  let { s, e, c, d } = this, tx, agentPK, desc, amount
  await effect.operation().then(op => op.transaction())
  .then(t => (tx = t).operations()).then(ops => {
    if (tx.memo_type != MemoText) { // not a make, a takeOffer effect
      return;
    }
    agentPK = ops.records[0].source_account
    desc = description(ops)
    amount = parseHEXA(desc)
  }).catch(e => { throw e; })
  if (!d.agent) {
    d.keysAgent = [null, agentPK]
    d.agent = await e.server.loadAccount(agentPK)
  }
  tXpush.call(this, [tx.id, { desc, memo: tx.memo }])
  if (++d.tXs_read == d.old_tXs_length) { // Model is initialized.
    // TODO take care of the (++d.tXs_read > d.old_tXs_length) case
    // when the model is not yet initialized.
    c.model.initialized = true

    let issuerEffects = s.shift()
    issuerEffects.close()
    e.log('closed', issuerEffects.tag)

    resolve.call(this, 'Model initialized.')
    e.log(this)

  }
}

function resolve (result) { // {{{1
  let { s, e, c, d } = this
  c.codec.resolve(result)
  c.model.resolve(result)
  c.view.resolve(result)
}

function tXpush (tX) { // {{{1
  let { s, e, c, d } = this
  let txid = tX[0], data = tX[1]
  let index = d.tXs2map.findIndex(v => v[0] == txid)
  index > -1 ? d.tXs2map[index].push(data) : d.tXs2map.push(tX)
}

export { // {{{1
  initModel, initVm, 
}
