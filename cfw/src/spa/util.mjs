import { Loader } from '@googlemaps/js-api-loader' // {{{1
import { apiKey, } from '../../../../../../../../../env.mjs'

let google, map, ok, notok, guests = { add: [] }, myId // {{{1
let wait4setup = new Promise((g, b) => { ok = g; notok = b; })
let wait4markup = new Promise((g, b) => { guests.ok = g; guests.notok = b; })

class Popup { // {{{1
  constructor(position, content) {
    this.position = position;
    content.classList.add("popup-bubble");

    // This zero-height div is positioned at the bottom of the bubble.
    const bubbleAnchor = document.createElement("div");

    bubbleAnchor.classList.add("popup-bubble-anchor");
    bubbleAnchor.appendChild(content);
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
    return fetch(this.guestUseSvcUrl, { method: 'GET', }).then(async response => {
      let text
      if (response.ok) {
        text = await response.text()
        console.log('- user.bindToAgent guestUseSvcUrl fetch text', text)

        return Promise.resolve(this);
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
  // }}}2
}

function configure (user) { // {{{1
  setup(user.position, user.guestId).then(a => flag(a))
  return Promise.resolve(new User(user));
}

function flag (position) { // {{{1
  let p = new google.maps.LatLng(position.lat, position.lng)
  let popup = new Popup(p, document.getElementById('user2join'))
  popup.ov.setMap(map)
  //popup.containerDiv.addEventListener('click', e => showModal('getUserInfo'))
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
    zoom: 5
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
