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
      if (event.target == background && span.style.display == 'block') {
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
  }
  static take (vm, txid) { // {{{2
    let tX = vm.d.tXs_mapped.find(x => x.txid == txid)
    let content = document.getElementById('takeX')
    let x = document.getElementById('takeXX')
    let secret = document.getElementById('stellar-secret')
    let buttonConfirm = document.getElementById('confirm-take')
    buttonConfirm.onclick = function () {
      vm.e.log('- taking tX', tX, 'secret', secret)

      x.style.display = 'none'
      content.appendChild(document.createTextNode('loading your account...'))
    }
    x.style.display = 'block'
    vm.c.view.modalPane.show('takeX')
    return 'taking...';
  } // }}}2
}

function addMx () { // {{{1
  let { s, e, c, d } = this
  const buttonMx = document.createElement("button")
  buttonMx.textContent = 'Mx'
  buttonMx.title = 'Make Offer or Request'
  buttonMx.type = 'button'
  buttonMx.addEventListener('click', _ => alert('XA'))
  const divMx = document.createElement("div")
  divMx.appendChild(buttonMx)
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(divMx)
}

function addTake (x) { // {{{1
  let take = `window.vm.c.kit.take("${x.txid}")`
  x.desc += `<hr/><button class='take' onclick='${take}'>Take</button>`
}

function decodeDownstream () { // {{{1
  let { s, e, c, d } = this
  c.codec.decodeX()
  //vm.c.codec.decodeDownstream.resolve('First test of decodeDownstream.')
}

function decodeX () { // {{{1
  let { s, e, c, d } = this
  if( !c.view.initialized) {
    return;
  }
  while (d.tXs2map.length > 0) {
    let tx = d.tXs2map.shift()
    let x = tx[1].length == 2 ? tx[2] : tx[1]
    x.txid = tx[0]
    x.position = {
      lat: tx[1].length == 2 ? tx[1][0] : tx[2][0],
      lng: tx[1].length == 2 ? tx[1][1] : tx[2][1]
    }
    let f = x.memo.startsWith('Offer') ? markOfferMade : markRequestMade
    addTake(x)
    x.marker = f.call(this, x.position, x.pk, x.desc)
    d.tXs_mapped.push(x)
  }
}

function encodeUpstream () { // {{{1
  let { s, e, c, d } = this
  //vm.c.codec.encodeUpstream.resolve('First test of encodeUpstream.')
}

function encodeX () { // {{{1
  let { s, e, c, d } = this
}

function initModel () { // {{{1
  // Model is initialized when d.tXs2map holds locations and 
  // { amount, desc, memo, pk } objects for all d.old_tXs_length transactions. 
  // A location is an array. A transaction
  // is either
  //           [ txid, [ lng, lat ], { amount, desc, memo, pk } ]
  // or
  //           [ txid, { amount, desc, memo, pk }, [ lng, lat ] ]
  // array.
  let { s, e, c, d } = this
  Object.assign(d, { tXs2map: [], tXs_mapped: [], tXs_read: 0 })

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
    mapId: "Stellar_HEX_MAP_ID",
    mapTypeId: "OSM",
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 2
  };
  loader.load().then(g => {
    map = new g.maps.Map(document.getElementById("map"), mapOptions);
    let mapTypeOSM = new g.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
        return `https://tile.openstreetmap.org/${zoom}/${coord.x}/${coord.y}.png`;
      },
      tileSize: new g.maps.Size(256, 256),
      name: "OpenStreetMap",
      maxZoom: 18
    })
    map.mapTypes.set("OSM", mapTypeOSM)
    return google.maps.importLibrary('marker');
  }).then(r => {
    c.marker = r
    return google.maps.importLibrary('maps');
  }).then(r => {
    c.maps = r
    addMx.call(this)

    c.view.initialized = true
    c.codec?.decodeX()
    c.view.resolve(ModalPane.init(this))
  })
  .catch(e => { console.error(e); }); 
}

function mark (position, title, content) { // {{{1
  let { s, e, c, d } = this
  const marker = new c.marker.AdvancedMarkerElement({ 
    map, position, title, content: c.pin.element
  });
  const infoWindow = new c.maps.InfoWindow()
  marker.addListener('click', ({ domEvent, latLng }) => {
    const { target } = domEvent
    infoWindow.close()
    infoWindow.setContent(content)
    infoWindow.open(marker.map, marker)
  })
  return marker;
}

function markOfferMade (position, title, content) { // {{{1
  let { s, e, c, d } = this
  c.pin = new c.marker.PinElement({
    background: "green",
    borderColor: "black",
    glyphColor: "white",
    //scale: 0.8,
  })
  return mark.call(this,
    position, title, content
  );
}

function markOfferTaken () { // {{{1
  let { s, e, c, d } = this
  c.markerOffer.content = new c.marker.PinElement({ 
    background: "green",
    borderColor: "black",
    glyph: '1',
  }).element
}

function markRequestMade (position, title, content) { // {{{1
  let { s, e, c, d } = this
  c.pin = new c.marker.PinElement({
    background: "red",
    borderColor: "black",
    glyphColor: "white",
    //scale: 0.8,
  })
  return mark.call(this,
    position, title, content
  );
}

function markRequestTaken () { // {{{1
  let { s, e, c, d } = this
  c.markerRequest.content = new c.marker.PinElement({ 
    background: "red",
    borderColor: "black",
    glyph: '1',
  }).element
}

function markTaking (position, title, content) { // {{{1
  let { s, e, c, d } = this
  c.countTakes ??= 1
  c.pin = new c.marker.PinElement({
    background: "yellow",
    borderColor: "black",
    glyph: `${c.countTakes++}`,
    //scale: 0.8,
  })
  return mark.call(this,
    position, title, content
  );
}

async function onIssuerEffect (effect) { // claimable_balance_claimant_created {{{1
  let { s, e, c, d } = this, tx, txPK, desc, amount
  await effect.operation().then(op => op.transaction())
  .then(t => (tx = t).operations()).then(ops => {
    if (tx.memo_type != MemoText) { // not a make, a takeOffer effect
      return;
    }
    txPK = ops.records[0].source_account
    desc = description(ops)
    amount = parseHEXA(desc)
  }).catch(e => { throw e; })
  if (!d.agent) {
    d.keysAgent = [null, txPK]
    d.agent = await e.server.loadAccount(txPK)
  }
  tXpush.call(this, [tx.id, { amount, desc, memo: tx.memo, pk: txPK }])
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

function take (txid) { // {{{1
  ModalPane.take(window.vm, txid)
}

function tXpush (tX) { // {{{1
  let { s, e, c, d } = this
  let txid = tX[0], data = tX[1]
  let index = d.tXs2map.findIndex(v => v[0] == txid)
  if (index == -1) {
    d.tXs2map.push(tX)
    return;
  }
  d.tXs2map[index].push(data)
  c.codec?.decodeX()
}

export { // {{{1
  decodeDownstream, decodeX, encodeUpstream, encodeX,
  initModel, initView, initVm,
  take,
}
