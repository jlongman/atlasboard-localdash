widget = {
  //runs when we receive data from the job
  onData: function (el, data) {

    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }

    $('.content', el).empty();
    var table =  $('.content', el).append(
      "<table class='table'>"
    );
    for (var i = 0; i < data.modes.length; i++) {
      var datum = data.modes[i];
      if (!datum.normal) {
        $('.table', el).append(
          // "<a class='img'>" +
          // "<img width='50px' src='/widgets/resources?resource=localdash/images/mode_" + datum.mode + ".png'/>" +
          // "</a>" +
          "<tr ><td style='height:25%'><div class='alerttext'>&#x26A0</div></td><td class='bd'>" +
          "<span class='label' style='color:"+ datum.lineName.toLowerCase()+"'>" +
        datum.lineName + "</span>"+
        "<br/>" +

          datum.message +
          "</td></tr>"
        );
      } else {
        $('.table', el).append(
          // "<a class='img'>" +
          // "<img width='50px' src='/widgets/resources?resource=localdash/images/mode_" + datum.mode + ".png'/>" +
          // "</a>" +
          "<tr ><td style='height:25%'></td><td class='bd'>" +
          "<span class='label' style='color:"+ datum.lineName.toLowerCase()+"'>" +
          datum.lineName + "</span>"+
          "<br/>" +
          datum.message +
          "</td></tr>"
        );
      }
    }
    $('.content', el).append(
      "</ul>"
    );
  }
};