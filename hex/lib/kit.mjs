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
import { Loader } from '@googlemaps/js-api-loader'
import { apiKey, } from '../../../../../env.mjs'

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

class ModalPane { // {{{1
  constructor (vm) { // {{{2
    this.vm = vm
  }

  show (contentId, close = null) { // {{{2
    let background = document.getElementById("modalRoot");
    background.style.display = "block";
    let content = document.getElementById(contentId)
    content.style.display = "block";

    // Get the <span> element that closes the modal
    let span = document.getElementById(`${contentId}X`)

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      background.style.display = "none";
      content.style.display = "none";
      !!close && close()
    }

    // When the user clicks anywhere outside of the content, close the modal.
    window.onclick = function(event) {
      if (event.target == background) {
        background.style.display = "none";
        content.style.display = "none";
        !!close && close()
      }   
    }
  }

  static init (vm) { // {{{2
    vm.c.view.modalPane = new ModalPane(vm)
    vm.c.view.modalPane.show('welcome2HEX')
    return 'View initialized.';
  } // }}}2
}

function decodeDownstream () { // {{{1
  let { s, e, c, d } = this
  //vm.c.codec.decodeDownstream.resolve('First test of decodeDownstream.')
}

function encodeUpstream () { // {{{1
  let { s, e, c, d } = this
  //vm.c.codec.encodeUpstream.resolve('First test of encodeUpstream.')
}

function initModel () { // {{{1
  // Model is initialized when d.tXs2map holds locations and { desc, memo }
  // for all d.old_tXs_length transactions. A location is an array. A transaction
  // is either
  //           [ txid, [ lng, lat ], { desc, memo } ]
  // or
  //           [ txid, { desc, memo }, [ lng, lat ] ]
  // array.
  let { s, e, c, d } = this
  Object.assign(d, { tXs2map: [], tXs_read: 0 })

  fetch(d.user.guestUseSvcUrl, { method: 'GET', }).then(response => response.json())
  .then(json => {
    d.old_tXs_length = json.taken.length
    for (let tX of json.taken) {
      tXpush.call(this, tX)
    }
  })
}

function initView () { // {{{1
  let { s, e, c, d } = this
  const loader = new Loader({ apiKey, version: "weekly", })
  const mapOptions = {
    center: d.user.position,
    mapTypeId: "OSM",
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 2
  };
  loader.load().then(g => {
    c.google = g
    map = new g.maps.Map(document.getElementById("map"), mapOptions);
    mapTypeOSM = new g.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
        return `https://tile.openstreetmap.org/${zoom}/${coord.x}/${coord.y}.png`;
      },
      tileSize: new g.maps.Size(256, 256),
      name: "OpenStreetMap",
      maxZoom: 18
    })

    // Define OSM map type pointing at the OpenStreetMap tile server
    map.mapTypes.set("OSM", mapTypeOSM)

    c.view.resolve(ModalPane.init(this))

  }).catch(e => { console.error(e); }); 
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
    document.getElementById("welcome2HEXX").style.display = "block";

    let issuerEffects = s.shift()
    issuerEffects.close()
    e.log('closed', issuerEffects.tag)

    c.model.resolve('Model initialized.')
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
  decodeDownstream, encodeUpstream,
  initModel, initView, initVm, 
}
