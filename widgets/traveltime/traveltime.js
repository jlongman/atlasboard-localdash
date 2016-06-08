widget = {
  //runs when we receive data from the job
  onData: function (el, data) {

    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }

    $('.content', el).empty();
    for (var i = 0; i < data.modes.length; i++) {
      var datum = data.modes[i];
      $('.content', el).append(
        "<a class='img'>" +
        "<img width='50px' src='/widgets/resources?resource=localdash/images/mode_" + datum.mode + ".png'/>" +
        "</a>" +
        "<div class='bd'>" +
        datum.message +
        "</div>"
      );
    }

  }
};