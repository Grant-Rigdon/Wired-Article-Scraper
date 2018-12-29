//Scrape button
$("#scrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {        
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
$(".save").on("click", function(event) {
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
$(".delete").on("click", function(event) {
    event.preventDefault()
    var postId = $(this).attr("post-id");
    $.ajax({
        method: "POST",
        url: "/delete/" + postId
    }).done(function(data) {
        window.location = "/saved"
    })
});

//Handle Note button
$(".note").on("click", function() {
    var thisId = $(this).attr("post-id");
    if (!$("#message-text" + thisId).val()) {
        alert("Oops! It looks like there is no note to save")
    }else {
      $.ajax({
            method: "POST",
            url: "/note/" + thisId,
            data: {
              body: $("#message-text" + thisId).val()
            }
          }).done(function(data) {
              // Log the response
              console.log(data);
              // Empty the notes section
              $("#message-text" + thisId).val("");
              $(".modalNote").modal("hide");
              window.location = "/saved"
          });
    }
});

//Handle Delete Note button
$(".note-delete").on("click", function(event) {
    event.preventDefault()
    var thisId = $(this).attr("note-id");
    $.ajax({
        method: "DELETE",
        url: "/note-delete/" + thisId
    }).done(function(data) {
        console.log(data)        
        window.location = "/saved"
    })
});