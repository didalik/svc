const algorithm = { name: "ECDSA", hash: { name: "SHA-384" }, namedCurve: "P-384" } // {{{1
const base64ToUint8 = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0))
const uint8ToBase64 = (arr) => Buffer.from(arr).toString('base64')
// HUGE thanks to:
// - https://1loc.dev/string/convert-an-uint8-array-to-a-base64-encoded-string/

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
      throw new Error(response.status)
    });
}

async function pGET_parms (remote, noget, role = 'OWNER', e = process.env) { // {{{1
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

export { // {{{1
  generate_keypair, pGET, pGET_parms,
}
