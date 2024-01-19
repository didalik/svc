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

async function sign (keypair) { // TODO better name for keypair {{{1
  let pk = await this.exportKey('raw', keypair.publicKey)
  //console.error('- sign keypair.data2sign', keypair.data2sign, 'pk', uint8ToBase64(pk))

  keypair.data2sign = keypair?.data2sign.toString() ?? pk
  const b64data = uint8ToBase64(keypair.data2sign)
  const signature = await this.sign(algorithm, keypair.privateKey, new TextEncoder().encode(b64data))
  return [b64data, uint8ToBase64(new Uint8Array(signature))];
}

let signedData = data => base64ToUint8(data).toString().split(',').reduce((s, c) => s + String.fromCodePoint(c), '') // {{{1

async function verifyData (data, signer, signature) { // {{{1
  //console.log('- verifyData signer', signer, 'signature', signature)
  let a = base64ToUint8(signer)
  signature = base64ToUint8(signature)

  const importedPK = await this.importKey('raw', a.buffer, algorithm, true, ['verify'])
  return await this.verify(algorithm, importedPK, signature, new TextEncoder().encode(data));
}

export { // {{{1
  USER_URL, WS_USER_URL, algorithm, base64ToUint8, generate_keypair, 
  pGET, pGET_parms, sign, signedData, verifyData, uint8ToBase64,
}
