
const algorithm = { name: "ECDSA", hash: { name: "SHA-384" }, namedCurve: "P-384" } // {{{1

async function pGET ( // {{{1
  path = '', 
  parms = '', 
  keypair = null,
  noget = false,
  site = window.CFW_URL_DEV
) {
  keypair ??= await window.crypto.subtle.generateKey(algorithm, true, ['sign', 'verify'])
  let [b64data, b64signature] = await sign(keypair.publicKey, keypair)
  let eb64d = encodeURIComponent(b64data), eb64s = encodeURIComponent(b64signature)
  let parmsTail = `eb64d=${eb64d}&eb64s=${eb64s}`
  parms = parms.length == 0 ? `?${parmsTail}` : parms + `&${parmsTail}`

  if (noget) {
    return `${site}${path}${parms}`;
  }
  return fetch(`${site}${path}${parms}`, { method: 'GET', })
    .then(async response => {
      if (response.ok) {
        return response.text();
      }
      let text
      try {
        text = await response.text()
      } catch(e) {
        console.error(e)
        throw new Error(response.status)
      }
      console.error('- pGET', response.status, text)
    });
}

async function sign (obj, keypair) { // {{{1
  const uint8ToBase64 = (arr) => Buffer.from(arr).toString('base64')
  if (obj.type == 'public' && obj.extractable) { // obj is CryptoKey
    const exportedPK = await window.crypto.subtle.exportKey('raw', obj)
    const b64data = uint8ToBase64(new Uint8Array(exportedPK))
    const signature = await window.crypto.subtle.sign(algorithm, keypair.privateKey, new TextEncoder().encode(b64data))
    return [b64data, uint8ToBase64(new Uint8Array(signature))];
// HUGE thanks to:
// - https://1loc.dev/string/convert-an-uint8-array-to-a-base64-encoded-string/
  }
  throw new Error(`UNEXPECTED obj ${obj}`)
}

export { // {{{1
  algorithm, pGET, sign,
}
