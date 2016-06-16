/**
 * Created by longman on 2016-06-08.
 */

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
};

// ~1m accuracy
function roundToFive(num) {
  return +(Math.round(num + "e+5")  + "e-5");
};

function roundToSix(num) {
  return +(Math.round(num + "e+6")  + "e-6");
};

function roundToSeven(num) {
  return +(Math.round(num + "e+7")  + "e-7");
};

module.exports.distance = distance;
module.exports.roundToMeter = roundToFive;
