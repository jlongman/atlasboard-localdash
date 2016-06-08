widget = {
  //runs when we receive data from the job
  onData: function (el, data) {

    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }
    $('.content', el).empty();
    $('.content', el).append(
      "<a class='img'>" +
      "<img width='50px' src='/widgets/resources?resource=localdash/traveltimemap/mode_" + data.mode + ".png'/>" +
      "</a>" +
      "<div class='bd'>" +
      data.text  +
      // "<p>" + data.text + "</p>" +
      "<a href='" + data.linkurl + "' class='imgExt'>" +
      "<img src='" + data.mapurl + "'/>" +
      "</a>"+
    "</div>"
    )
    ;


  }
};