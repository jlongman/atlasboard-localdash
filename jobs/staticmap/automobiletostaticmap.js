/**
 * Created by longman on 2016-06-01.
 */
/**
 * Job: staticmap
 * Code fragment from automobile atlasboard
 * Example Config:
 *    "limit": 600,
 *    "count": 20,
 *    "automobile": {
 *      "loc": "montreal"
 *  },
 *
 * limit is radial distance in meters
 * count is the count-closest stations max
 */

/**
 *
 * NOTE THE AUTOMOBILE API COORDINATES FOR LATITUDE AND LONGITUDE ARE "REVERSED"?
 *
 * @param limit distance in meters
 * @param count number of cars
 * @param config detailed above
 * @param json response from automobile API
 * @returns {string} URL which are markers for automobile
 */
function automobilejson_to_static_map(limit, count, config, json) {
  // logger.trace(json);
  var url = "";
  var vehicles = json["Vehicules"];

  var distance = require('./distance');

  var closecars = [];
  {
    for (var i = 0; i < vehicles.length; i++) {
      var vehicle = vehicles[i];
      vehicle.coordinates = [vehicle.Position.Lat, vehicle.Position.Lon]; // we inject to be consistent
      vehicle.distance = distance.distance(vehicle.coordinates[0], vehicle.coordinates[1], config.lat, config.lon);
      // console.log (config.loc +" - " +vehicle.distance);
      if (vehicle.distance < limit) {
        closecars.push(vehicle);
      }
    }
  }

  {
    closecars = closecars.sort(function (a, b) {
      return a.distance - b.distance;
    });
    if (config.icon) {
      if (config.icon == "" || config.icon == "default") {
        url += "&markers=icon:" + "http://goo.gl/pYt2Es";
      } else {
        url += "&markers=icon:" + config.icon;
      }
    } else {
      url += "&markers=color:orange";
    }
    for (var j = 0; j < closecars.length && j < count; j++) {
      var close = closecars[j];
      url += "|" + distance.roundToMeter(close.coordinates[0]) + "," + distance.roundToMeter(close.coordinates[1]);
    }
  }
  return url;
}

module.exports.automobilejson_to_static_map = automobilejson_to_static_map;
