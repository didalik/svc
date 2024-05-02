import { Loader } from '@googlemaps/js-api-loader' // {{{1
import { apiKey, } from '../../../../../../env.mjs'
import { WsConnection, } from './ws.mjs'

let google, map, ok, notok, guests = { add: [] }, myId // {{{1
let wait4setup = new Promise((g, b) => { ok = g; notok = b; })
let wait4markup = new Promise((g, b) => { guests.ok = g; guests.notok = b; })

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
        text = await response.text() // 'OK'
        this.wsConnection?.isOn || new WsConnection(this)
        console.log('- user.bindToAgent guestUseSvcUrl fetch this', this)

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

function flag (position) { // {{{1
  let p = new google.maps.LatLng(position.lat, position.lng)
  let popup = new Popup(p, document.getElementById('center-bubble'),
    document.getElementById('center-radios')
  )
  popup.ov.setMap(map)
}

function mark (position, title, content) { // {{{1
  const marker = new google.maps.Marker({ map, position, title, })
  const infowindow = new google.maps.InfoWindow({ content })
  google.maps.event.addListener(marker, 'click', _ => infowindow.open(map, marker))
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
  console.log('- setup center', center, 'guestId', guestId)

  const loader = new Loader({ apiKey, version: "weekly", });
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

    // Define OSM map type pointing at the OpenStreetMap tile server
    map.mapTypes.set("OSM", new google.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
        return "https://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
      },
      tileSize: new google.maps.Size(256, 256),
      name: "OpenStreetMap",
      maxZoom: 18
    }))
    return center;
  }).catch(e => { console.error(e); });
}

function teardown () { // {{{1
  alert('teardown')
}

export { // {{{1
  configure,
}
