/**
 * Created by longman on 2016-06-01.
 */
var distance = require('./distance');
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

function get_close_cars(limit, config, json) {
  const vehicles = json["placemarks"];
  var closecars = []
  for (var i = 0; i < vehicles.length; i++) {
    var vehicle = vehicles[i];
    vehicle.distance = distance.distance(vehicle.coordinates[1], vehicle.coordinates[0], config.lat, config.lon);
    // console.log (config.loc +" - " +vehicle.distance);
    if (vehicle.distance < limit) {
      closecars.push(vehicle);
    }
  }
  return closecars;
}

function drawcars(closecars, icon) {
    var url = "&markers=" + icon

    for (var i = 0; i < closecars.length; i++) {
      var close = closecars[i];
      url += "|" + distance.roundToMeter(close.coordinates[1]) + "," + distance.roundToMeter(close.coordinates[0]);
    }
    return url
}
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

  
  var closecars = get_close_cars(limit, config, json);
  closecars = closecars.sort(function (a, b) {
      return a.distance - b.distance;
  });
  if (closecars.length > count) {
     closecars.length = count;
  }
  if (closecars.length > 0) {
     const closeSmart = closecars.filter(function(car) {
         return car.vin.startsWith("WME");
     });

    if (config.icon) {
      if (config.icon == "" || config.icon == "default") {
        icon = "icon:" + "http://goo.gl/OXgCcL";
      } else {
        icon = "icon:" + config.icon;
      }
    } else {
      icon = "color:blue";
    }
     url += drawcars(closeSmart, icon);
     const closeOther = closecars.filter(function(car) {
         return !car.vin.startsWith("WME");
     });
     url += drawcars(closeOther, "icon:" + "http://goo.gl/LeCk5y");
  }
  return url;
}

module.exports.car2gojson_to_static_map = car2gojson_to_static_map;
