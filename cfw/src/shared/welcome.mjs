let buttonContinue = document.getElementById('buttonContinue') // {{{1
let buttonShare = document.getElementById('buttonShare')
let divContinue = document.getElementById('divContinue')
let GUEST_USE_SVC_URL = 'GUEST'
let latitude = XXX, longitude = XXX, bound, boundOrigin

window.addEventListener('message', e => { // {{{1
  console.log(e.origin)
  console.log(e.data)
  boundOrigin ??= e.origin
  bound?.postMessage([latitude, longitude], e.origin)
})

console.log('GUEST_USE_SVC_URL length', GUEST_USE_SVC_URL.length) // {{{1

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
  bound = window.open(GUEST_USE_SVC_URL, '_blank')
}
