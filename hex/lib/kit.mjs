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

function getXids2map () { // {{{1
  let { s, e, c, d } = this
  return fetch(d.user.guestUseSvcUrl, { method: 'GET', }).
    then(response => response.json())
}

function getXs (json) { // {{{1
  let { s, e, c, d } = this
  e.log(json)
}

function initModel () { // {{{1
  let { s, e, c, d } = this
  getXids2map.call(this).then(json => getXs.call(this, json))
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
    if (tx.memo.startsWith('Offer')) {
    } else {
    }
  }).catch(e => { throw e; })
  if (d.agent) {
  } else {
    d.keysAgent = [null, agentPK]
    d.agent = await e.server.loadAccount(agentPK)
  }
  e.log(tx.memo, desc, amount, tx.id)
}

export { // {{{1
  initModel, initVm, 
}
