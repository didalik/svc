import { Loader } from '@googlemaps/js-api-loader' // {{{1
import { apiKey, } from '../../../../../../../../../env.mjs'

let google, map, ok, notok // {{{1

function markAgent (data) { // {{{
  data = JSON.parse(data[0])
  if (data.length > 2) {
    return false;
  }
  console.log('- markAgent', data)

  let promise = new Promise((g, b) => { ok = g; notok = b; })
  promise.then(_ => {
    const marker = new google.maps.Marker({ map, position: { lat: data[0], lng: data[1] }, title: "agent", });
    const infowindow = new google.maps.InfoWindow({
      content: 'Undisclosed location',
    }); 
    google.maps.event.addListener(marker, "click", () => {
      infowindow.open(map, marker);
    });
  }).catch(e => console.error(e))

  return true;
}

function setup (center, guestId) { // {{{1
  const loader = new Loader({ apiKey, version: "weekly", });
  const mapOptions = {
    center,
    mapTypeId: "OSM",
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 5
  };
  loader.load().then(g => {
    google = g; ok()
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
  markAgent, setup, teardown,
}
