$(document).on("click", "li", function() {
  const notes = $("#note-box");

  notes.empty();

  var thisId = $(this).attr("data-id");

  // Call to get articles with related notes
  $.ajax({
    method: "GET",
    url: "/api/articles/" + thisId
  }).done(function(data) {
      console.log(data);

      notes.append("<h2>" + data.title + "</h2>");
      notes.append("<input id='titleinput' name='title' placeholder='Note Title'>");
      notes.append("<textarea id='bodyinput' name='body'></textarea>");
      notes.append("<button class='btn btn-primary' data-id='" + data._id + "' id='savenote'>Save Note</button>");
      // check for data
      if (data.note) {
        $("#titleinput").val(data.note.title);
        $("#bodyinput").val(data.note.body);
      }
    });
});


$(document).on("click", "#savenote", function() {
  var thisId = $(this).attr("data-id");

  // Run a POST request update and/or save note
  $.ajax({
    method: "POST",
    url: "/api/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  }).done(function(data) {
      console.log(data);
      $("#note-box").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
