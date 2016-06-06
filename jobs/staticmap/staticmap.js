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

 * zoom if unset google decides zoom
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
    function theme_map() {
      var SP = require('./snazzythemetostaticmap');
      var look = require('./themes/' + config.theme);

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
    var url = "http://maps.googleapis.com/maps/api/staticmap?" +
      "center=" + config.lat + "," + config.lon +
      "&size=" + size;
    if (config.globalAuth && config.globalAuth.staticmap && config.globalAuth.staticmap.apikey) {
      url += "&key=" + config.globalAuth.staticmap.apikey;
    }
    if (config.zoom) {
      url += "&zoom=" + config.zoom;
    }
    url += "&markers=color:green|label:X|" + config.lat + "," + config.lon + "";

    var err = null;
    if (config.city) {
      var bixi2sm = require('./bixitostaticmap');
      var bixiurl = bixi2sm.cities[config.city].url;
      if (config.url) {
        bixiurl = config.url;
      }
      dependencies.easyRequest.HTML(bixiurl, function (err, json) {
        url += bixi2sm.bixijson_to_static_map(config, json);
        if (config.theme) {
          url += theme_map();
        }
        // console.log(url);
        jobCallback(err, {title: config.widgetTitle, url: url});
      });
    } else {
      if (config.theme) {
        url += theme_map();
      }
      jobCallback(err, {title: config.widgetTitle, url: url});
    }
  }
};