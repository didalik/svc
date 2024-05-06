import { // {{{1
  pocAgentSellHEXA, pocSetup,
} from '../../../../hex/lib/poc.mjs'
import {
  addHEX_Agent, addHEX_CREATOR, addHEX_Issuer,
} from '../../../../hex/lib/sdk.mjs'

/* Mapping JS code imports to vim tabs and splits, example: {{{1

 this.mjs ---> poc.mjs ---> api.mjs
         \        |        /
          \       |       /
           \      V      /
            -> sdk.mjs <-

               maps to

|     tab 1      |    tab 2      |    tab 3
|        |poc.mjs|       |api.mjs|       |       |
|this.mjs|-------|poc.mjs|-------|api.mjs|sdk.mjs|
|        |sdk.mjs|       |sdk.mjs|       |       |
*/

function startDemo () { // {{{1
  let amountHEXA = '10000'

  return addHEX_CREATOR.call(this)
  .then(_ => addHEX_Issuer.call(this, 'svc-hex.didalik.workers.dev'))
  .then(_ => addHEX_Agent.call(this, amountHEXA))
  .then(_ => pocAgentSellHEXA.call(this))
  .then(_ => pocSetup.call(this))
  .then(poc => poc.run())
  .then(poc => poc.cleanup());
}

export { // {{{1
  startDemo,
}
