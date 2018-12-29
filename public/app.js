//Scrape button
$("#scrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        console.log(data)
        window.location = "/"
    })
});

// Clear button
$("#clear").on("click",function(){
    $.ajax({
        method: "DELETE",
        url: "/clear",
    }).done(function(data) {
        console.log(data)
        window.location = "/"
    })
})

//Save Article button
$("#save").on("click", function(event) {
    event.preventDefault()
    var postId = $(this).attr("post-id")
    console.log("button clicked"+postId)
    $.ajax({
        method: "POST",
        url: "/save/" + postId
    }).done(function(data) {
        window.location = "/"
    })
});

//Delete Article button
$("#delete").on("click", function(event) {
    event.preventDefault()
    var postId = $(this).attr("post-id");
    $.ajax({
        method: "POST",
        url: "/delete/" + postId
    }).done(function(data) {
        window.location = "/saved"
    })
});

//Handle Save Note button
$(".saveNote").on("click", function() {
    var thisId = $(this).attr("data-id");
    if (!$("#noteText" + thisId).val()) {
        alert("please enter a note to save")
    }else {
      $.ajax({
            method: "POST",
            url: "/notes/save/" + thisId,
            data: {
              text: $("#noteText" + thisId).val()
            }
          }).done(function(data) {
              // Log the response
              console.log(data);
              // Empty the notes section
              $("#noteText" + thisId).val("");
              $(".modalNote").modal("hide");
              window.location = "/saved"
          });
    }
});

//Handle Delete Note button
$(".deleteNote").on("click", function() {
    var noteId = $(this).attr("data-note-id");
    var articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/notes/delete/" + noteId + "/" + articleId
    }).done(function(data) {
        console.log(data)
        $(".modalNote").modal("hide");
        window.location = "/saved"
    })
});