/**
 * Job: staticmap
 * Code fragment from bixi atlastboard
 * Example Config:
 * "mystaticmap": {
 *    "lat": 45.76727,
 *    "lon":-73.99392888,
 *    "limit": 600,
 *    "count": 20,
 *    "maptype": "terrain",
 *    "size": "640x640",
 *    "zoom":16,
 *    "communauto": {
 *      "cityID": 59
 *    },
 *    "bixi": {
 *      "city": "montreal"
 *    },
 *    "car2go": {
 *      "loc" : "montreal"
 *    }
 * }
 *
 * lat centre of map
 * lon centre of map
 * limit is radial distance in meters, optional
 * count is the count-closest stations max, optional
 * maptype roadmap, satellite, hybrid, terrain; may help with theming url length issues, optional
 * zoom is recommended at 15 or 16, if unset google decides zoom, optional
 * size defaults to 640x640, the max available wihtout a Google API key, optional
 *
 * config.globalAuth.staticmap.apikey is the Google API Key, required for maps larger than 640x640
 * config.globalAuth.car2go.apikey is the car2go key
 *
 * bixi.city values, mandatory:
 *   montreal, ottawa, boston, chicago, nyc, toronto, columbus, chattanooga, sf
 * Adding new bixi cities requires understanding which pattern the city uses then changing the structures in
 * bixitostaticmap.js.
 *
 * car2go.loc is their city identifier, mandatory
 *
 */
const cache_response = {};
module.exports = {

  /**
   * Executed on job initialisation (only once)
   * @param config
   * @param dependencies
   */
  onInit: function (config, dependencies) {

    /*
     This is a good place for initialisation logic, like registering routes in express:

     dependencies.logger.info('adding routes...');
     dependencies.app.route("/jobs/mycustomroute")
     .get(function (req, res) {
     res.end('So something useful here');
     });
     */
  },


  /**
   * Executed every interval
   * @param config
   * @param dependencies
   * @param jobCallback
   */
  onRun: function (config, dependencies, jobCallback) {

    /*
     1. USE OF JOB DEPENDENCIES

     You can use a few handy dependencies in your job:

     - dependencies.easyRequest : a wrapper on top of the "request" module
     - dependencies.request : the popular http request module itself
     - dependencies.logger : atlasboard logger interface

     Check them all out: https://bitbucket.org/atlassian/atlasboard/raw/master/lib/job-dependencies/?at=master

     */

    var logger = dependencies.logger;

    /*

     2. CONFIGURATION CHECK

     You probably want to check that the right configuration has been passed to the job.
     It is a good idea to cover this with unit tests as well (see test/staticmap file)

     Checking for the right configuration could be something like this:
     */
    if (!config.lat) {
      return jobCallback('missing latitude(config.lat)! ');
    }
    if (!config.lon) {
      return jobCallback('missing longitude (config.lon)!');
    }

    /*
     4. USE OF JOB_CALLBACK

     Using nodejs callback standard conventions, you should return an error or null (if success)
     as the first parameter, and the widget's data as the second parameter.

     This is an example of how to make an HTTP call to google using the easyRequest dependency,
     and send the result to the registered widgets.
     Have a look at test/staticmap for an example of how to unit tests this easily by mocking easyRequest calls

     */
    function theme_map(theme) {
      var SP = require('./snazzythemetostaticmap');
      var look = require('./themes/' + theme);

      var lookurl = "";
      if (!SP.look_cache[lookurl]) {
        SP.StaticParams.parse(look.lookjson);
        SP.look_cache[lookurl] = SP.StaticParams.get();
      }
      return SP.look_cache[lookurl];
    }

    var size = "640x640";
    if (config.size) {
      size = config.size;
    }
    var limit = 700;
    if (config.limit) {
      limit = config.limit;
    }
    var count = 50;
    if (config.count) {
      count = config.count;
    }


    var calls = [];

    function append_theme_safe(mapurllength) {
      var theme = "";
      if (config.themeString) {
        theme = config.themeString;
      } else if (config.theme) {
        theme = theme_map(config.theme);
      }
      if (mapurllength + theme.length >= 8192) {
        logger.warn("Long staticmap URL with theme : (" + mapurllength + ", " + theme.length + ") " + theme);
        theme = "";
      }
      return theme;
    }


    if (config.communauto) {
      config.communauto.lat = config.lat;
      config.communauto.lon = config.lon;
      var communauto2sm = require('./communautotostaticmap');

      // Automobile portion
      calls.push(function (callback) {
        var automobileurl = "https://www.reservauto.net/WCF/LSI/LSIBookingService.asmx/GetVehicleProposals?Callback=?&CustomerID=\"\"&Latitude=0&Longitude=0";
        dependencies.easyRequest.HTML(automobileurl, function (err, jsonp) {
          var err = null;
          try {
            var json = JSON.parse(jsonp.substring(2, jsonp.length - 2));
            var urlfragment = communauto2sm.automobilejson_to_static_map(limit, count, config.communauto, json);
            if (urlfragment.length >= 2048) {
              logger.error("Long staticmap (automobile) URL fragment: (" + urlfragment.length + ") " + urlfragment);
            }
          } catch (err_or) {
            if (typeof err_or !== 'undefined') {
              err = err_or;
            }
          }
          callback(err, urlfragment);
        });
      });
      if (config.communauto.cityID) {
        // communauto portion - data never changes
        var communautourl = "https://www.reservauto.net/Scripts/Client/Ajax/PublicCall/Select_ListStations.asp?BranchID=''&CurrentLanguageID=1";
        communautourl += "&CityID=" + config.communauto.cityID;

        calls.push(function (callback) {
          var key_cache = "communauto-" + encodeURIComponent(config.lat + config.lon);
          if (!cache_response[key_cache]) {
            var err = null;
            dependencies.easyRequest.HTML(communautourl, function (err, jsonp) {
              try {
                // console.log(jsonp.substring(1, jsonp.length - 1).replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'));
                // convert from broken jsonp to json
                jsonp = jsonp.substring(1, jsonp.length - 1).replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
                var json = JSON.parse(jsonp);
                var urlfragment = communauto2sm.communautojson_to_static_map(limit, count, config.communauto, json);
                if (urlfragment.length >= 2048) {
                  logger.error("Long staticmap (automobile) URL fragment: (" + urlfragment.length + ") " + urlfragment);
                }
                cache_response[key_cache] = urlfragment;
              } catch (err_or) {
                if (typeof err_or !== 'undefined') {
                  err = err_or;
                }
              }
              callback(err, urlfragment);
            });
          } else {
            callback(err, cache_response[key_cache]);
          }
        });
      }
    }


    if (config.car2go) {
      // http://www.car2go.com/api/v2.1/vehicles?loc=austin&oauth_consumer_key=consumerkey&format=json
      var car2gourl = "http://www.car2go.com/api/v2.1/vehicles?format=json";
      car2gourl += "&loc=" + config.car2go.loc;
      if (config.globalAuth && config.globalAuth.car2go && config.globalAuth.car2go.apikey) {
        car2gourl += "&oauth_consumer_key=" + config.globalAuth.car2go.apikey;
      }
      config.car2go.lat = config.lat;
      config.car2go.lon = config.lon;
      calls.push(function (callback) {
        var car2go2sm = require('./car2gotostaticmap');
        dependencies.easyRequest.JSON(car2gourl, function (err, json) {
          try {
            var urlfragment = car2go2sm.car2gojson_to_static_map(limit, count, config.car2go, json);
            if (urlfragment.length >= 2048) {
              logger.error("Long staticmap URL: (" + url.length + ") " + url);
            }
          } catch (err_or) {
            if (typeof err_or !== 'undefined') {
              err = err_or;
            }
          }
          callback(err, urlfragment);
        });
      });
    }

    if (config.bixi) {
      config.bixi.lat = config.lat;
      config.bixi.lon = config.lon;

      var bixi2sm = require('./bixitostaticmap');
      var bixiurl = bixi2sm.cities[config.bixi.city].url;
      if (config.bixi.url) {
        bixiurl = config.bixi.url; // hidden override
      }
      calls.push(function (callback) {
        dependencies.easyRequest.JSON(bixiurl, function (err, json) {
          try {
            var urlfragment = bixi2sm.bixijson_to_static_map(limit, count, config.bixi, json);
            if (urlfragment.length >= 2048) {
              logger.error("Long staticmap URL: (" + urlfragment.length + ") " + urlfragment);
            }
          } catch (err_or) {
            if (typeof err_or !== 'undefined') {
              if (typeof err_or !== 'undefined') {
                err = err_or;
              }
            }
          }
          callback(err, urlfragment);
        });
      });
    }

    dependencies.async.parallel(calls, function (err, results) {
        // optional callback
        var url = "https://maps.googleapis.com/maps/api/staticmap?" +
          "center=" + config.lat + "," + config.lon +
          "&size=" + size;
        if (config.globalAuth && config.globalAuth.staticmap && config.globalAuth.staticmap.apikey) {
          url += "&key=" + config.globalAuth.staticmap.apikey;
        }
        // url += "&scale=2"; // experimental
        if (config.zoom) {
          url += "&zoom=" + config.zoom;
        }
        if (config.maptype) {
          url += "&maptype=" + config.maptype;
        }
        url += "&markers=color:yellow|" + config.lat + "," + config.lon + "";
        for (var i = 0; i < results.length; i++) {
          logger.trace(i + ": " + results[i]);
          url += results[i];
          if (url.length >= 2048) {
            logger.error("Long staticmap with URL fragment: (" + i + " - " + url.length + ") " + url);
            break;
          }
        }
        url += append_theme_safe(url.length);
        jobCallback(err, {title: config.widgetTitle, url: url});
      }
    );
  }
};
