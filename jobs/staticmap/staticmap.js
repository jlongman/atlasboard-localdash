/**
 * Job: staticmap
 * Code fragment from bixi atlastboard
 * Example Config:
 * "mystaticmap": {
 *    "lat": 40.76727,
 *    "lon":-73.99392888,
 *    "limit": 600,
 *    "count": 20,
 *    "maptype": "terrain",
 *    "size": "640x640",
 *    "zoom":16
 *    "bixi": {
 *      "city": "nyc"
 *    },
 *    "car2go": {
 *      "loc" : "montreal"
 *      "apikey" : "YourCar2GoConsumerKey",
 *    }
 * }
 *
 * lat centre of map
 * lon centre of map
 * limit is radial distance in meters
 * count is the count-closest stations max
 * maptype roadmap, satellite, hybrid, terrain; may help with theming url length issues
 * zoom is recommended at 15 or 16, if unset google decides zoom
 * size defaults to 640x640, the max available wihtout a Google API key
 *
 * config.globalAuth.staticmap.apikey is the Google API Key, required for maps larger than 640x640
 *
 * bixi.city values:
 *  montreal, ottawa, boston, chicago, nyc, toronto, columbus, chattanooga, sf
 *
 * car2go.loc is their city identifier
 * car2go.key is their oauth key
 *
 */

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
    var limit = 600;
    if (config.limit) {
      limit = config.limit;
    }
    var count = 100;
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
      if (mapurllength + theme.length >= 2048) {
        logger.warn("Long staticmap URL with theme : (" + mapurllength + ", " + theme.length + ") " + theme);
        theme = "";
      }
      return theme;
    }


    if (config.automobile) {
      //https://www.reservauto.net/WCF/LSI/LSIBookingService.asmx/GetVehicleProposals?Callback=?&CustomerID=""&Latitude=0&Longitude=0
      var automobileurl = "https://www.reservauto.net/WCF/LSI/LSIBookingService.asmx/GetVehicleProposals?Callback=?&CustomerID=\"\"&Latitude=0&Longitude=0";
      config.automobile.lat = config.lat;
      config.automobile.lon = config.lon;
      calls.push(function (callback) {
        var automobile2sm = require('./automobiletostaticmap');
        dependencies.easyRequest.HTML(automobileurl, function (err, jsonp) {
          var json = JSON.parse(jsonp.substring(2, jsonp.length - 2));
          var urlfragment = automobile2sm.automobilejson_to_static_map(limit, count, config.automobile, json);
          if (urlfragment.length >= 2048) {
            logger.error("Long staticmap (automobile) URL fragment: (" + urlfragment.length + ") " + urlfragment);
          }
          callback(null, urlfragment);
        });
      });
    }


    if (config.car2go) {
      // http://www.car2go.com/api/v2.1/vehicles?loc=austin&oauth_consumer_key=consumerkey&format=json
      var car2gourl = "http://www.car2go.com/api/v2.1/vehicles?format=json";
      car2gourl += "&loc=" + config.car2go.loc;
      car2gourl += "&oauth_consumer_key=" + config.car2go.apikey;
      config.car2go.lat = config.lat;
      config.car2go.lon = config.lon;
      calls.push(function (callback) {
        var car2go2sm = require('./car2gotostaticmap');
        dependencies.easyRequest.JSON(car2gourl, function (err, json) {
          var urlfragment = car2go2sm.car2gojson_to_static_map(limit, count, config.car2go, json);
          if (urlfragment.length >= 2048) {
            logger.error("Long staticmap URL: (" + url.length + ") " + url);
          }
          callback(null, urlfragment);
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
          var urlfragment = bixi2sm.bixijson_to_static_map(limit, count, config.bixi, json);
          if (urlfragment.length >= 2048) {
            logger.error("Long staticmap URL: (" + urlfragment.length + ") " + urlfragment);
          }
          callback(null, urlfragment);
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
        if (config.zoom) {
          url += "&zoom=" + config.zoom;
        }
        if (config.maptype) {
          url += "&maptype=" + config.maptype;
        }
        url += "&markers=color:green|" + config.lat + "," + config.lon + "";
        for (var i = 0; i < results.length; i++) {
          logger.trace(i + ": " + results[i]);
          url += results[i];
          if (url.length >= 2048) {
            logger.error("Long staticmap with URL fragment: (" + i + " - " + url.length + ") " + url);
            break;
          }
          url += append_theme_safe(url.length);
        }
        jobCallback(err, {title: config.widgetTitle, url: url});
      }
    );
  }
};