import { setup, } from '../../../../../cfw/src/util.mjs' // {{{1

setup() // {{{1

let buttonContinue = document.getElementById('buttonContinue') // {{{1
let buttonShare = document.getElementById('buttonShare')
let divContinue = document.getElementById('divContinue')
buttonContinue.focus()
buttonContinue.onclick = _ => {
  buttonContinue.disabled = true
  buttonContinue.style.display = 'none'
  divContinue.style.display = 'block'
  buttonShare.focus()
}
buttonShare.onclick = _ => {
  buttonShare.disabled = true
  buttonShare.style.display = 'none'
}

