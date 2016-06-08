/**
 * Created by longman on 2016-06-01.
 */
/**
 * Job: staticmap
 * Code fragment from bixi atlasboard
 * Example Config:
 *    "limit": 600,
 *    "count": 20,
 *    "bixi": {
 *      "lat": 40.76727,
 *      "lon": -73.99392888,
 *      "city": "nyc"
 *      "apikey" : "YourGoogleAPIKey",
 *      "size": "640x640",
 *      "zoom": 16
 *  },
 *  
 * limit is radial distance in meters
 * count is the count-closest stations max
 *
 * city values:
 *  montreal, ottawa, boston, chicago, nyc, toronto, columbus, chattanooga, sf
 *
 * OPTIONAL
 *    "apikey" : "YourGoogleAPIKey",
 *    "size": "640x640",
 *    "zoom":16
 *
 * apikey is the Google API Key, required for maps larger than 640x640
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

function bixijson_to_static_map(limit, count, config, json) {
  var schema_indirection = preconfig[config.city];
  var schema_stations = preconfig_type[schema_indirection.type].stations;
  var schema_lat = preconfig_type[schema_indirection.type].la;
  var schema_long = preconfig_type[schema_indirection.type].lo;
  var schema_bikes = preconfig_type[schema_indirection.type].ba;

  // logger.trace(html);

  var url = "";
  
  var stations = JSON.parse(json)[schema_stations];
  var distance = require('./distance');

  var closestations = []
  for (var i = 0; i < stations.length; i++) {
    var station = stations[i];
    station.coordinates = [station[schema_lat], station[schema_long]];
    station.distance = distance.distance(station.coordinates[0], station.coordinates[1], config.lat, config.lon);
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
    url += "|" + distance.roundToMeter(close.coordinates[0]) + "," + distance.roundToMeter(close.coordinates[1]);
  }
  return url;
};

module.exports.bixijson_to_static_map = bixijson_to_static_map;
module.exports.cities = preconfig;