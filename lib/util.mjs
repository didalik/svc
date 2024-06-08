/* Copyright (c) 2023-present, Дід Alik and the Kids {{{1
 *
 * This script is licensed under the Apache License, Version 2.0, found in the
 * LICENSE file in the root directory of this source tree.
 * * */

const algorithm = { name: "ECDSA", hash: { name: "SHA-384" }, namedCurve: "P-384" } // {{{1
const base64ToUint8 = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0))
const uint8ToBase64 = (arr) => Buffer.from(arr).toString('base64')
// HUGE thanks to:
// - https://1loc.dev/string/convert-an-uint8-array-to-a-base64-encoded-string/

async function USER_URL (data2sign, remoteStr, e) { // {{{1
  let [privateKey, publicKey, host, noget] = await pGET_parms.call(this, remoteStr, 'noget', 'USER', e)
  let actorPK = encodeURIComponent(e.USER_PK)
  let text = await pGET.call(this,
    '/svc/user_url_stub/' + e.actorId, 
    `?actorPK=${actorPK}`,
    { data2sign, privateKey, publicKey }, host, noget
  )
  return text;
}

async function WS_USER_URL (data2sign, remoteStr, e) { // {{{1
  let [privateKey, publicKey, host, noget] = await pGET_parms.call(this, remoteStr, 'noget', 'USER', e)
  let actorPK = encodeURIComponent(e.USER_PK)
  let SVC_PK = encodeURIComponent(e.SVC_PK)
  let text = await pGET.call(this,
    '/ws/user/' + e.actorId, 
    `?actorPK=${actorPK}&SVC_PK=${SVC_PK}`,
    { data2sign, privateKey, publicKey }, host, noget
  )
  return text.replace('http', 'ws');
}

function addLine (content, line) { // {{{1
  content.appendChild(document.createTextNode(line))
  content.appendChild(document.createElement('br'))
}

function b64_to_utf8( str ) { // {{{1
  return decodeURIComponent(escape(atob( str )));
}

async function generate_keypair () { // {{{1
  const keypair = await this.generateKey(algorithm, true, ['sign', 'verify'])
  let pk = await this.exportKey('raw', keypair.publicKey)
  let sk = await this.exportKey('jwk', keypair.privateKey)
  pk = uint8ToBase64(new Uint8Array(pk))
  sk = JSON.stringify(sk)
  return `${sk} ${pk}`;
}

async function pGET ( // {{{1
  path = '', 
  parms = '', 
  keypair = null,
  host = window.CFW_URL_DEV,
  noget = false
) {
  keypair ??= await this.generateKey(algorithm, true, ['sign', 'verify'])
  let [b64data, b64signature] = await sign.call(this, keypair)
  let eb64d = encodeURIComponent(b64data), eb64s = encodeURIComponent(b64signature)
  let parmsTail = `eb64d=${eb64d}&eb64s=${eb64s}`
  parms = parms.length == 0 ? `?${parmsTail}` : parms + `&${parmsTail}`

  if (noget) {
    return `${host}${path}${parms}`;
  }
  return fetch(`${host}${path}${parms}`, { method: 'GET', })
    .then(async response => {
      if (response.ok) {
        return await response.text(); // TODO is await needed here?
      }
      let text
      try {
        text = await response.text()
      } catch(e) {
        console.error(e)
        throw new Error(response.status)
      }
      console.error('- pGET ERROR', response.status, text)
      return response.status;
    });
}

async function pGET_parms (remote, noget, role = 'OWNER', e = process.env) { // {{{1
  //console.error('- pGET_parms remote', remote, 'role', role, 'noget', noget, 'process.argv', process.argv, 'e', e)

  let a = base64ToUint8(e[role + '_PK'])
  let publicKey = await this.importKey('raw', a.buffer, algorithm, true, ['verify'])
  a = JSON.parse(e[role + '_SK'])
  let privateKey = await this.importKey('jwk', a, algorithm, true, ['sign'])
  let host = remote == 'remote' ? `https://svc-${e.SVC_NAME}.didalik.workers.dev`
  : `http://${e.HOST_SVC ?? '127.0.0.1'}:${e.PORT_SVC ?? e['PORT_' + e.SVC_NAME] ?? 8787}`
  noget = noget == 'noget';
  //console.error('- pGET_parms remote', remote, 'host', host, 'noget', noget)

  return [privateKey, publicKey, host, noget];
}

function retrieveItem (itemName) { // {{{1
  if (!storageAvailable('localStorage')) {
    throw 'localStorage NOT available'
  }
  let item = localStorage.getItem(itemName)
  return item ? JSON.parse(b64_to_utf8(item))[itemName] : undefined;
}

async function sign (keypair) { // TODO better name for keypair {{{1
  let pk = await this.exportKey('raw', keypair.publicKey)
  //console.error('- sign keypair.data2sign', keypair.data2sign, 'pk', uint8ToBase64(pk))

  keypair.data2sign = keypair?.data2sign.toString() ?? pk
  const b64data = uint8ToBase64(keypair.data2sign)
  const signature = await this.sign(algorithm, keypair.privateKey, new TextEncoder().encode(b64data))
  return [b64data, uint8ToBase64(new Uint8Array(signature))];
}

let signedData = data => base64ToUint8(data).toString().split(',').reduce((s, c) => s + String.fromCodePoint(c), '') // {{{1

function storageAvailable(type) { // {{{1
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

function storeItem (itemName, item) { // {{{1
  if (!storageAvailable('localStorage')) {
    throw 'localStorage NOT available'
  }
  let itemWrap = {}
  itemWrap[itemName] = item
  localStorage.setItem(itemName, utf8_to_b64(JSON.stringify(itemWrap)))
}

let timestamps = {} // function timestamp (label = 'default') {{{1
function timestamp (label = 'default') {
  let q = Date.now()
  let p = timestamps[label] ?? 0
  timestamps[label] = q
  return q - p;
}

function utf8_to_b64( str ) { // {{{1
  return btoa(unescape(encodeURIComponent( str )));
}

async function verifyData (data, signer, signature) { // {{{1
  //console.log('- verifyData signer', signer, 'signature', signature)
  let a = base64ToUint8(signer)
  signature = base64ToUint8(signature)

  const importedPK = await this.importKey('raw', a.buffer, algorithm, true, ['verify'])
  return await this.verify(algorithm, importedPK, signature, new TextEncoder().encode(data));
}

export { // {{{1
  USER_URL, WS_USER_URL, addLine, algorithm, base64ToUint8, generate_keypair, 
  pGET, pGET_parms, retrieveItem, sign, signedData, storeItem,
  timestamp, verifyData, uint8ToBase64,
}
