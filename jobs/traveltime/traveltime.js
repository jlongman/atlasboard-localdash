/**
 * Job: traveltime
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

    /*

     2. CONFIGURATION CHECK

     You probably want to check that the right configuration has been passed to the job.
     It is a good idea to cover this with unit tests as well (see test/traveltime file)

     Checking for the right configuration could be something like this:
     */

    if (!config.origin) {
      if (!config.origin_lat || !config.origin_lon) {
        return jobCallback('You must have origin_lan AND origin_lon, or an origin ');
      }
    }
    if (!config.destination) {
      if (!config.destination_lat || !config.destination_lon) {
        return jobCallback('You must have destination_lan AND destination_lon, or an destination ');
      }
    }

    if (!config.globalAuth && !config.globalAuth.traveltime && !config.globalAuth.traveltime.apikey) {
      return jobCallback('You must have config.globalAuth.traveltime.apikey defined');
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
     Have a look at test/traveltime for an example of how to unit tests this easily by mocking easyRequest calls

     */
    var url = "https://maps.googleapis.com/maps/api/distancematrix/json?";
    if (!config.origin) {
      url += "origins=" + config.origin_lat + "," + config.origin_lon;
    } else {
      url += "origins=" + encodeURIComponent(config.origin);
    }
    if (!config.destination) {
      url += "&destinations=" + config.destination_lat + "," + config.destination_lon;
    } else {
      url += "&destinations=" + encodeURIComponent(config.destination);
    }

    if (config.globalAuth && config.globalAuth.traveltime && config.globalAuth.traveltime.apikey) {
      url += "&key=" + config.globalAuth.traveltime.apikey;
    }

    if (config.units) {
      url += "&units=" + String(config.units);
    }

    var mode = "driving";
    if (config.mode) {
      mode = config.mode;
    }
    url += "&mode=" + mode;
    
    dependencies.easyRequest.HTML(url, function (err, json) {
      // logger.trace(json);
      var results = JSON.parse(json);
      var message = results.rows[0].elements[0].duration.text;
      var widgetTitle = config.widgetTitle;
      if (config.mode) {
        widgetTitle += " - " + config.mode;
      }
      if (config.destination) {
        widgetTitle += " - " + config.destination;
      }
      var datum = [{
        "message": message,
        "mode": config.mode
      }];
      jobCallback(err, {title: widgetTitle, modes: datum});
    });
  }
};