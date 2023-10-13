let buttonContinue = document.getElementById('buttonContinue')
let buttonShare = document.getElementById('buttonShare')
let divContinue = document.getElementById('divContinue')
let GUEST_USE_SVC_URL = 'XXXX'

console.log('GUEST_USE_SVC_URL', GUEST_USE_SVC_URL.length, GUEST_USE_SVC_URL)

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
  let bound = window.open(GUEST_USE_SVC_URL, '_blank')
}
