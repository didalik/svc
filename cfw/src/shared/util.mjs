import { Loader } from '@googlemaps/js-api-loader' // {{{1
import { apiKey, } from '../../../../../../../../../env.mjs'

function setup () { // {{{1
  const loader = new Loader({ apiKey, version: "weekly", });
  const center = { lat: 25.95850, lng: -80.13810 }
  const mapOptions = {
    center,
    mapTypeId: "OSM",
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 5
  };
  loader
    .load()
    .then((google) => {
      let map = new google.maps.Map(document.getElementById("map"), mapOptions);
      const marker = new google.maps.Marker({ map, position: center, title: "Your position", });

      const infowindow = new google.maps.InfoWindow({
        content: 'Your message',
      }); 
      google.maps.event.addListener(marker, "click", () => {
        infowindow.open(map, marker);
      });

      //Define OSM map type pointing at the OpenStreetMap tile server
      map.mapTypes.set("OSM", new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
          return "https://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OpenStreetMap",
        maxZoom: 18
      }))
/*
*/
    })
    .catch(e => {
      // do something
    });
}

function teardown () { // {{{1
  alert('teardown')
}

export { // {{{1
  setup, teardown,
}
