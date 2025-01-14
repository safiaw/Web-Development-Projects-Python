$(".readMoreBtn").on("click", function (){
    console.log("In readmore function");

    var btnId = $(this).attr("id");
    var moreText = "."+ btnId + "Text";
    if ($(this).text() == "Read more »"){
       $(this).text("Read less »");
       $(`${moreText}`).css("display","inline");
       $(`${moreText}`).slideDown();
    } else {
        $(this).text("Read more »");
        $(`${moreText}`).css("display","none");
        $(`${moreText}`).slideUp();
    }
}
); 

$("body").on("click", function(event){
    if ($(event.target).hasClass("nav-link"))
    {
        $(".nav-link").removeClass("active");
        $(event.target).addClass("active");        
    }
    else 
    {
        $(".nav-link").removeClass("active");
    }
});

$(".filter-link").on("click", function (event){

    var linkId = $(event.target).attr("id") + "Col";
    console.log(linkId);
    //var showCols = "div" + "#"+linkId;
    $("div.projectList > div.col").each(function (){
       console.log($(this).attr("id")); 
       var colId = "#" + $(this).attr("id");
       if ( $(this).attr("id") === linkId)
       { 
        console.log("Hello, I'm in show")
        $(`${colId}`).show();
        //e.stopPropagation();
       }
       else 
       {
        console.log("Hello, I'm in hide")
        $(`${colId}`).hide("fast");
        //e.stopPropagation();
       }
    });
});
 




// $("#toggle").on("click", function() {
//     console.log("In readmore function");
//     var elem = $("#toggle").text();
//     if (elem == "Read more »") {
//     //Stuff to do when btn is in the read more state
//     $("#toggle").text("Read less »");
//     $("#moreText").slideDown();
//     } else {
//     //Stuff to do when btn is in the read less state
//     $("#toggle").text("Read more »");
//     $("#moreText").slideUp();
//     }
// });

// if ($("#dots").css("display") === "none") {
//     // when more text is displayed
//     // no dots is displayed
//     // button text changed to read less
// $("#dots").css("display","inline");
// $("#moreText").css("display","none");
// $("#toggle").text("Read more »");
// } 
// else {
//     // when more text is not displayed
//     // dots is displayed
//     // button text changed to read more
// $("#dots").css("display","none");
// $("#moreText").css("display","inline");
// $("#toggle").text("Read less »");
// }
// }

