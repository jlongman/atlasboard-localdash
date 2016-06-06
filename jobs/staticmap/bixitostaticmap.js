/**
 * Created by longman on 2016-06-01.
 */
/**
 * Job: staticmap
 * Code fragment from bixi atlastboard
 * Example Config:
 * "mystaticmap": {
 *    "lat": 40.76727,
 *    "lon":-73.99392888,
 *    "city": "nyc"
 * }
 *
 * city values:
 *  montreal, ottawa, boston, chicago, nyc, toronto, columbus, chattanooga, sf
 *
 * OPTIONAL
 *    "key" : "YourGoogleAPIKey",
 *    "limit": 600,
 *    "count": 20,
 *    "size": "640x640",
 *    "zoom":16
 *
 * key is the Google API Key, required for maps larger than 640x640
 * limit is radial distance in meters
 * count is the count-closest stations max
 * zoom is recommended at 16
 * size defaults to 640x640, the max available wihtout a Google API key
 *
 * zoom if unset google decides zoom
 */
const preconfig_type = [
  {
    "url": "https://secure.bixi.com/data/stations.json",
    "stations": "stations",
    "la": "la",
    "lo": "lo",
    "ba": "ba"
  }, {
    "stations": "stationBeanList",
    "la": "latitude",
    "lo": "longitude",
    "ba": "availableBikes"
  }
];
const preconfig = {
  "montreal": {
    "url": "https://secure.bixi.com/data/stations.json",
    "type": 0
  },
  "ottawa": {
    "url": "https://secure.capitalbikeshare.com/data/stations.json",
    "type": 0
  },
  "boston": {
    "url": "https://secure.thehubway.com/data/stations.json",
    "type": 0
  },
  "chicago": {
    "url": "http://www.divvybikes.com/stations/json",
    "type": 1
  },
  "nyc": {
    "url": "https://feeds.citibikenyc.com/stations/stations.json",
    "type": 1
  },
  "toronto": {
    "url": "http://feeds.bikesharetoronto.com/stations/stations.json",
    "type": 1
  },
  "columbus": {
    "url": "http://feeds.cogobikeshare.com/stations/stations.json",
    "type": 1
  },
  "chattanooga": {
    "url": "http://www.bikechattanooga.com/stations/json",
    "type": 1
  },
  "sf": {
    "url": "http://www.bayareabikeshare.com/stations/json",
    "type": 1
  },
  "empty": {
    "url": "",
    "type": 0
  }
};

/* http://www.movable-type.co.uk/scripts/latlong.html */
/* MIT license: https://github.com/chrisveness/geodesy */
function distance(lat1, lon1, lat2, lon2) {
  if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function () {
      return this * Math.PI / 180;
    };
  }
  var R = 6371e3; // metres
  var l1 = lat1.toRadians();
  var l2 = lat2.toRadians();
  var dlat = (lat2 - lat1).toRadians();
  var dlong = (lon2 - lon1).toRadians();

  var a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.cos(l1) * Math.cos(l2) *
    Math.sin(dlong / 2) * Math.sin(dlong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  var d = R * c;
  return d; // metres
}

function bixijson_to_static_map(config, json) {
  var schema_indirection = preconfig[config.city];
  var schema_stations = preconfig_type[schema_indirection.type].stations;
  var schema_lat = preconfig_type[schema_indirection.type].la;
  var schema_long = preconfig_type[schema_indirection.type].lo;
  var schema_bikes = preconfig_type[schema_indirection.type].ba;

  // logger.trace(html);

  var url = "";

  if (!config.limit) {
    var limit = 600;
  } else {
    var limit = config.limit;
  }
  if (!config.count) {
    var count = 600;
  } else {
    var count = config.count;
  }

  var stations = JSON.parse(json)[schema_stations];

  var closestations = []
  for (var i = 0; i < stations.length; i++) {
    var station = stations[i];
    station.coordinates = [station[schema_lat], station[schema_long]];
    station.distance = distance(station.coordinates[0], station.coordinates[1], config.lat, config.lon);
    if (station.distance < limit) {
      closestations.push(station);
    }
  }

  var showstations;

  {
    closestations = closestations.sort(function (a, b) {
      return a.distance - b.distance;
    });

    if (count >= closestations.length) {
      showstations = closestations;
    } else {
      showstations = [];
      for (var i = 0; i < closestations.length && i < count; i++) {
        showstations.push(closestations[i]);
      }
    }
  }

  // sort so that bikes with the same label are close to each other
  // optimizes URL space
  showstations = showstations.sort(function (a, b) {
    return a.ba - b.ba;
  });

  var lastba = -1;
  for (var i = 0; i < showstations.length && i < count; i++) {
    var close = showstations[i];
    var closeba = close[schema_bikes]
    if (closeba != lastba && lastba < 10) {
      lastba = closeba;
      url += "&markers=color:"
      if (closeba == 0) {
        url += "gray|size=small|label:0";
      } else {
        if (closeba > 9) {
          closeba = 9
        }
        url += "red|label:" + closeba;
      }
    }
    url += "|" + close.coordinates[0] + "," + close.coordinates[1];
  }
  return url;
}

module.exports.bixijson_to_static_map = bixijson_to_static_map;
module.exports.cities = preconfig;