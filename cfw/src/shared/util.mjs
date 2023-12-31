import { Loader } from '@googlemaps/js-api-loader' // {{{1
import { apiKey, } from '../../../../../../../../../env.mjs'

let google, map, ok, notok, guests = { add: [] }, myId // {{{1
let wait4setup = new Promise((g, b) => { ok = g; notok = b; })
let wait4markup = new Promise((g, b) => { guests.ok = g; guests.notok = b; })

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
  loader.load().then(g => {
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
  }).catch(e => { console.error(e); });
}

function teardown () { // {{{1
  alert('teardown')
}

export { // {{{1
  markup, setup, teardown,
}
