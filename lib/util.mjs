
function pGET ( // {{{1
  path = '', 
  parms = '', 
  secret = null,
  noget = false,
  site = CFW_URL_DEV
) {
  let keypair = secret ? window.StellarSdk.Keypair.fromSecret(secret)
  : window.StellarSdk.Keypair.random()
  let data = keypair.publicKey()
  let signature = keypair.sign(data)
  signature = encodeURIComponent(signature.toString('base64'))
  let parmsTail = `sk=ASK_&network=${window.StellarNetwork.id}&${data}=${signature}`
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
      console.error('-', response.status, text)
    });
}

// ./run.mjs share-service $TARGET_NETWORK $REPO_URL $COMMIT_ID $SERVICE_PATH $SERVICE_SK
  async share (opts) { // {{{2
    console.dir(opts, { depth: null })

    let kp = null
    let sk = process.argv[7] ?? (kp = window.StellarSdk.Keypair.random()).secret()
    if (!kp) {
      kp = window.StellarSdk.Keypair.fromSecret(sk)
    }   
    let repo = encodeURIComponent(process.argv[4])
    let pk = kp.publicKey()
    let pksigned = encodeURIComponent(kp.sign(pk).toString('base64'))
    return await pGET(
      `/share-service/${process.argv[5]}/${process.argv[6]}`,
      `?repo=${repo}&pk=${pk}&pksigned=${pksigned}`,
      process.env[`HEXA_ISSUER_SECRET_${window.StellarNetwork.id}`], 
      opts.log, opts.site
    ).then(result => ({ result, sk })).catch(e => {
      console.error(e)
      return e.code;
    }); 
  }

