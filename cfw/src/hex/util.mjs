import { Loader } from '@googlemaps/js-api-loader' // {{{1
import { apiKey, } from '../../../../../../env.mjs'
import { WsConnection, } from './ws.mjs'

let google, map, ok, notok, guests = { add: [] }, myId // {{{1
let wait4setup = new Promise((g, b) => { ok = g; notok = b; })
let wait4markup = new Promise((g, b) => { guests.ok = g; guests.notok = b; })
let mapTypeOSM

class Popup { // {{{1
  constructor(position, bubble, radios) {
    this.position = position;
    bubble.classList.add("popup-bubble");
    radios.classList.add("popup-radios");

    // This zero-height div is positioned at the bottom of the bubble.
    const bubbleAnchor = document.createElement("div");

    bubbleAnchor.classList.add("popup-bubble-anchor");
    bubbleAnchor.appendChild(bubble);
    bubbleAnchor.appendChild(radios);
    // This zero-height div is positioned at the bottom of the tip.
    this.containerDiv = document.createElement("div");
    this.containerDiv.classList.add("popup-container");
    this.containerDiv.appendChild(bubbleAnchor);
    // Optionally stop clicks, etc., from bubbling up to the map.
    google.maps.OverlayView.preventMapHitsAndGesturesFrom(this.containerDiv);
    let ov = new google.maps.OverlayView(); this.ov = ov
    ov.onAdd = _ => ov.getPanes().overlayMouseTarget.appendChild(this.containerDiv)
    ov.onRemove = _ => this.containerDiv?.parentElement.removeChild(this.containerDiv)
    ov.draw = _ => {
      const divPosition = this.ov.getProjection().fromLatLngToDivPixel(
        this.position
      );
      // Hide the popup when it is far out of view.
      const display =
        Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
          ? "block"
          : "none";

      if (display === "block") {
        this.containerDiv.style.left = divPosition.x + "px";
        this.containerDiv.style.top = divPosition.y + "px";
      }
      if (this.containerDiv.style.display !== display) {
        this.containerDiv.style.display = display;
      }
    }
  }
}

class User { // {{{1
  constructor (data) { // {{{2
    Object.assign(this, data)
  }
  bindToAgent (svc) { // {{{2
    this.svc = svc
    let promise = new Promise((g, b) => { this.bound = g; this.notok = b; })
    return fetch(this.guestUseSvcUrl, { method: 'GET', }).then(async response => {
      let text
      if (response.ok) {
        text = await response.text() // 'OK' TODO slowbosh
        this.wsConnection?.isOn || new WsConnection(this)
        return promise;
      }
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
  boundToAgent (agentId) { // {{{2
    console.log('- user.boundToAgent agentId', agentId)

    this.bound(this)
  }
  onclose (a) { // {{{2
    let { s, e, c, d } = window.vm
    let issuerEffects = s.shift()
    issuerEffects.close()
    e.log('closed', issuerEffects.tag)
  }
  use (svc) { // {{{2
    let promise = new Promise((g, b) => { this.closing = g; this.notok = b; })
    document.getElementById('center-radios').style.display = 'block'
    document.getElementById('center-radio-users').onclick = _ => {
      console.log('- user.use svc watch guests')
      this.wsConnection.send({ request: 'guests', })
      this.wsConnection.onJsoa = 'watchGuests'
    }
    document.getElementById('center-radio-hackers').onclick = _ => {
      console.log('- user.use svc watch hackers')
      this.wsConnection.send({ request: 'hackers', })
      this.wsConnection.onJsoa = 'watchHackers'
    }
    /*
    */
    document.getElementById('center-radio-more').onclick = _ => {
      window.open('https://github.com/didalik/svc/#readme', '_blank')
    }
    return promise;
  }

  watchGuests (jsoa) { // {{{2
    console.log('- user.watchGuests jsoa.length', jsoa.length)
    document.getElementById('center-radios').parentElement.style.display = 'none'
    jsoa.forEach(s => mark(
      { lat: s[1], lng: s[2] }, 
      'guest', 
      'Visited on ' + new Date(s[0])
    ))
  }

  watchHackers (jsoa) { // {{{2
    console.log('- user.watchHackers jsoa.length', jsoa.length)
    document.getElementById('center-radios').parentElement.style.display = 'none'
    jsoa.forEach((s, i) => {
      s = JSON.parse(s)
      //console.log('- user.watchHackers i', i, 's', s)
      let e = s[0].split(' ')
      mark({ lat: s[1][0], lng: s[1][1] }, e[1], 'Hit on ' + e[0])
    })
  }

  close () { // {{{2
    console.log('- user.close')
  }
  // }}}2
}

function configure (user) { // {{{1
  setup(user.position, user.guestId).then(a => flag(a))
  return Promise.resolve(new User(user));
}

function decode (args) { // {{{1
  let { s, e, c, d } = this
  //c.decoded.push(args)

  const offerBob = _ => args[0] == 'demoBob makeOffer'
  const offerMade = offer => markOfferMade.call(this,
    { lat: 25.68, lng: -80.20 }, 'Bob', offer
  )
  const offerTaken = _ => args[0].done == 'dealOffer'

  const requestAnn = _ => args[0] == 'demoAnn makeRequest'
  const requestMade = request => markRequestMade.call(this, 
    { lat: 25.72, lng: -80.25 }, 'Ann', request
  )
  const requestTaken = _ => args[0].done == 'dealRequest'

  const takeCyn = _ => args[0] == 'onIssuerEffectCyn take'
  const taking = _ => markTaking.call(this,
    { lat: 25.685, lng: -80.17 }, 'Cyn', 'taking...'
  )

  switch (true) {
    case offerBob():
      return c.markerOffer = offerMade(args[1]);
    case offerTaken():
      return markOfferTaken.call(this);
    case requestAnn():
      return c.markerRequest = requestMade(args[1]);
    case requestTaken():
      return markRequestTaken.call(this);
    case takeCyn():
      return taking();
  }
}

function dequeue (queue, dec) { // {{{1
  let { s, e, c, d } = this
  while (queue.length > 0) {
    let n = queue.shift()
    let args = queue.splice(0, n)
    dec.call(this,
      args
    )
  }
}

function flag (position) { // {{{1
  let p = new google.maps.LatLng(position.lat, position.lng)
  let popup = new Popup(p, document.getElementById('center-bubble'),
    document.getElementById('center-radios')
  )
  popup.ov.setMap(map)
}

function log (...args) { // {{{1
  console.log(...args)
  window.vm.c.queue.push(args.length, ...args)
  window.vm.c.dequeue && window.vm.c.dequeue.call(window.vm, 
    window.vm.c.queue, decode
  )
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

function markGuest (guest) { // {{{1
  if (guest[2] == guests.myId) {
    mark({ lat: guest[0], lng: guest[1] }, 'me', 'You are here.')
  } else {
    mark({ lat: guest[0], lng: guest[1] }, 'guest', 'Visited on ' + new Date(guest[2]))
  }
}

function markHistory (agent, data) { // {{{1
  guests.myId = myId
  mark({ lat: agent[0], lng: agent[1] }, 'agent', 'Undisclosed location')
  data.forEach(s => {
    let g = JSON.parse(s)
    mark({ lat: g[0], lng: g[1] }, 'guest', 'Visited on ' + new Date(g[2]))
  })
  guests.ok()
}

function markMore (guest, data) { // {{{1
  console.log('- markMore guest', guest, 'guests.myId', guests.myId)

  wait4markup.then(_ => markGuest(guest)).catch(e => console.error(e))
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

function markup (data) { // {{{1
  console.log('- markup data.length', data.length)

  let actor = JSON.parse(data.shift())
  if (actor.length > 2) { // actor is guest
    return markMore(actor, data);
  }
  data.pop() // removing the empty line
  console.log('- markup agent', actor)

  wait4setup.then(_ => markHistory(actor, data)).catch(e => console.error(e))
}

function setup (center, guestId) { // {{{1
  //console.log('- setup center', center, 'guestId', guestId) // {{{2

  const loader = new Loader({ apiKey, version: "weekly", }) // {{{2
  const mapOptions = {
    center,
    mapTypeId: "OSM",
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 2
  };
  return loader.load().then(g => {
    google = g; myId = guestId; ok()
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    mapTypeOSM = new google.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
        return "https://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
      },
      tileSize: new google.maps.Size(256, 256),
      name: "OpenStreetMap",
      maxZoom: 18
    })

    // Define OSM map type pointing at the OpenStreetMap tile server
    map.mapTypes.set("OSM", mapTypeOSM)
    return center; 
  }).catch(e => { console.error(e); }); // }}}2
}

function teardown () { // {{{1
  alert('teardown')
}

function visitHEX () { // {{{1
  let { s, e, c, d } = this
  console.log('- visitHEX this', this)
  return; // TODO implement

  const center = { lat: 25.74, lng: -80.2 }
  const mapOptions = {
    center,
    mapId: "PoC_MAP_ID",
    mapTypeId: "OSM",
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 12
  }
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  map.mapTypes.set("OSM", mapTypeOSM)

  google.maps.importLibrary("marker").then(r => {
    c.marker = r
    return google.maps.importLibrary('maps');
  }).then(r => {
    c.maps = r
    c.dequeue = dequeue
  })
}

export { // {{{1
  configure, log, visitHEX,
}
