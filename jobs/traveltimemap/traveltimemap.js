/**
 * Job: traveltimemap
 *
 * Expected configuration:
 *
 * ## PLEASE ADD AN EXAMPLE CONFIGURATION FOR YOUR JOB HERE
 * { 
 *   myconfigKey : [ 
 *     { serverUrl : 'localhost' } 
 *   ]
 * }
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

    if (!config.origin) {
      if (!config.origin_lat || !config.origin_lon) {
        return jobCallback('You must have origin_lan AND origin_lon, or an origin.');
      }
    }
    if (!config.destination) {
      if (!config.destination_lat || !config.destination_lon) {
        return jobCallback('You must have destination_lan AND destination_lon, or an destination ');
      }
    }

    if (!config.globalAuth && !config.globalAuth.traveltimemap && !config.globalAuth.traveltimemap.apikey) {
      return jobCallback('You must have config.globalAuth.traveltimemap.apikey defined');
    }

    /*

     3. SENDING DATA BACK TO THE WIDGET

     You can send data back to the widget anytime (ex: if you are hooked into a real-time data stream and
     don't want to depend on the jobCallback triggered by the scheduler to push data to widgets)

     jobWorker.pushUpdate({data: { title: config.widgetTitle, html: 'loading...' }}); // on Atlasboard > 1.0


     4. USE OF JOB_CALLBACK

     Using nodejs callback standard conventions, you should return an error or null (if success)
     as the first parameter, and the widget's data as the second parameter.

     This is an example of how to make an HTTP call to google using the easyRequest dependency,
     and send the result to the registered widgets.
     Have a look at test/traveltimemap for an example of how to unit tests this easily by mocking easyRequest calls

     */

    var url = "https://maps.googleapis.com/maps/api/directions/json?";
    if (!config.origin) {
      url += "origin=" + config.origin_lat + "," + config.origin_lon;
    } else {
      url += "origin=" + encodeURIComponent(config.origin);
    }
    if (!config.destination) {
      url += "&destination=" + config.destination_lat + "," + config.destination_lon;
    } else {
      url += "&destination=" + encodeURIComponent(config.destination);
    }

    // if (config.globalAuth && config.globalAuth.traveltimemap && config.globalAuth.traveltimemap.apikey) {
    //   url += "&key=" + config.globalAuth.traveltimemap.apikey;
    // }

    if (config.units) {
      url += "&units=" + String(config.units);
    }

    if (config.mode) {
      url += "&mode=" + config.mode;
    }

    dependencies.easyRequest.HTML(url, function (err, json) {
      // logger.trace(json);
      var results = JSON.parse(json);
      var message = results.routes[0].legs[0].duration.text;
      var widgetTitle = config.widgetTitle;
      var mode = "driving";
      if (config.mode) {
        mode = config.mode;
      }
      widgetTitle += " - " + mode;
      if (config.destination) {
        widgetTitle += " - " + config.destination;
      }

      var mapurl = "https://maps.googleapis.com/maps/api/staticmap?";
      // if (config.globalAuth && config.globalAuth.staticmap && config.globalAuth.staticmap.apikey) {
      //   mapurl += "&key=" + config.globalAuth.staticmap.apikey;
      // }
      // if (config.globalAuth && config.globalAuth.traveltime && config.globalAuth.traveltime.apikey) {
      //   mapurl += "&key=" + config.globalAuth.traveltime.apikey;
      // }
      mapurl += "&key=" + config.globalAuth.traveltimemap.apikey;
      mapurl += "&size=200x200";
      var quickmap = true;
      { // search for transit items, or use the quickmap
        out:      for (i = 0; i < results.routes[0].legs.length; i++) {
          var leg = results.routes[0].legs[i];
          for (j = 0; j < leg.steps.length; j++) {
            var step = leg.steps[j];
            if (step.transit_details) {
              quickmap = false;
              break out;
            }
          }
        }
      }
      if (config.maptype) {
        mapurl += "&maptype=" + config.maptype;
      }
      if (quickmap) {
        mapurl += "&path=";
        if (config.travelcolor) {
          mapurl += "color:" + config.travelcolor + "|";
        }
        mapurl += "enc:" + encodeURIComponent(results.routes[0].overview_polyline.points);
      } else {
        for (i = 0; i < results.routes[0].legs.length; i++) {
          leg = results.routes[0].legs[i];
          for (j = 0; j < leg.steps.length; j++) {
            step = leg.steps[j];
            mapurl += "&path=";
            if (step.transit_details && step.transit_details.line.color) {
              mapurl += "color:0" + step.transit_details.line.color.replace("#", "x") + "|";
            } else {
              if (config.travelcolor) {
                mapurl += "color:" + config.travelcolor + "|";
              }
            }
            mapurl += "enc:" + encodeURIComponent(step.polyline.points);
          }
        }
      }
      if (mapurl.length >= 2048) {
        logger.error("Long traveltimemap URL BEFORE theme: (" + mapurl.length + ") " + mapurl);
      }
      var theme = "";
      if (config.themeString) {
        theme += config.themeString;
        if (mapurl.length + theme.length >= 2048) {
          logger.warn("Long traveltimemap URL with theme : (" + mapurl.length + ", " + theme.length + ") " + mapurl + theme);
        } else {
          mapurl += theme;
        }
      }
      var linkurl = "https://maps.google.com/maps/dir/" +
        encodeURIComponent(results.routes[0].legs[0].start_address) + "/" +
        encodeURIComponent(results.routes[0].legs[0].end_address);
      modes = [
        {
          "text": message,
          "mode": mode,
          "mapurl": mapurl,
          "linkurl": linkurl
        }
      ]
      jobCallback(err, {title: widgetTitle, modes: modes});
    });
  }
};