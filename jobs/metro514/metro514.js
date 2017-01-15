/**
 * Job: metro
 *
 * Expected configuration:
 *
 * ## PLEASE ADD AN EXAMPLE CONFIGURATION FOR YOUR JOB HERE
 * {
 *   myconfigKey : [
 *     { language : {'french'|'english'} }
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
     It is a good idea to cover this with unit tests as well (see test/metro file)

     Checking for the right configuration could be something like this:
     */

    // if (!config.origin) {
    //   if (!config.origin_lat || !config.origin_lon) {
    //     return jobCallback('You must have origin_lan AND origin_lon, or an origin ');
    //   }
    // }

    var language = 'msg';
    if (!config || !config.language || config.language.toLowerCase() === "french") {
      language += 'Francais';
    } else {
      language += 'Anglais';
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
     Have a look at test/metro for an example of how to unit tests this easily by mocking easyRequest calls

     */
    const url = "http://www2.stm.info/1997/alertesmetro/esm.xml";
    const goodString = "Service normal";
    const nameTable = {
      'msgAnglais': ['Green', 'Orange', 'N/A', 'Blue', 'Yellow'],
      'msgFrancais': ['Vert', 'Orange', 'N/A', 'Bleu', 'Jaune']
    };

    var xml2js = require('xml2js');
    var parseString = xml2js.parseString;

    dependencies.easyRequest.HTML(url, function (err, xml) {
      // logger.trace(json);

      parseString(xml, function (err, result) {
        // console.dir(result);
        var datum = [];

        for (var count = 0, len = result.Root.Ligne.length; count < len; count ++) {
          var line = result.Root.Ligne[count];
          datum.push({
            "lineNo" : line['NoLigne'],
            "lineName" : nameTable[language][line['NoLigne'] - 1 ],
            "msg" : line['msgFrancais'],
            "normal" : ("" + line['msgFrancais']).indexOf(goodString) >= 0,
            "normaltype": typeof ("" + line['msgFrancais']),
            "message" : line[language]
          });
        }

        var widgetTitle = config.widgetTitle;
        jobCallback(err, {title: widgetTitle, modes: datum});
      });
    });
  }
};
