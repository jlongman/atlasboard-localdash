/**
 * Created by longman on 2016-06-01.
 */
/**
 * Job: staticmap
 * Code fragment from car2go atlasboard
 * Example Config:
 *    "limit": 600,
 *    "count": 20,
 *    "car2go": {
 *      "loc": "montreal"
 *      
 *  },
 *
 * limit is radial distance in meters
 * count is the count-closest stations max
 *
 * OPTIONAL
 *    "global.key" : "YourCar2GoConsumerKey",
 *
 * key is the Google API Key, required for maps larger than 640x640
 * zoom is recommended at 16
 * size defaults to 640x640, the max available wihtout a Google API key
 *
 * zoom if unset google decides zoom
 */

/**
 *
 * NOTE THE CAR2GO API COORDINATES FOR LATITUDE AND LONGITUDE ARE "REVERSED"
 *
 * @param limit distance in meters
 * @param count number of cars
 * @param config detailed above
 * @param json response from car2go API
 * @returns {string} URL which are markers for car2go
 */
function car2gojson_to_static_map(limit, count, config, json) {
  // logger.trace(json);
  var url = "";
  var vehicles = json["placemarks"];

  var distance = require('./distance');

  var closecars = []
  for (var i = 0; i < vehicles.length; i++) {
    var vehicle = vehicles[i];
    vehicle.distance = distance.distance(vehicle.coordinates[1], vehicle.coordinates[0], config.lat, config.lon);
    // console.log (config.loc +" - " +vehicle.distance);
    if (vehicle.distance < limit) {
      closecars.push(vehicle);
    }
  }

  if (closecars.length > 0) {
    closecars = closecars.sort(function (a, b) {
      return a.distance - b.distance;
    });
    if (config.icon) {
      if (config.icon == "" || config.icon == "default") {
        url += "&markers=icon:" + "http://goo.gl/OXgCcL";
      } else {
        url += "&markers=icon:" + config.icon;
      }
    } else {
      url += "&markers=color:blue";
    }

    for (var i = 0; i < closecars.length && i < count; i++) {
      var close = closecars[i];
      url += "|" + distance.roundToMeter(close.coordinates[1]) + "," + distance.roundToMeter(close.coordinates[0]);
    }
  }
  return url;
}

module.exports.car2gojson_to_static_map = car2gojson_to_static_map;
