// on a key press - start the game
// generate a random number between 0 to 3
// map numbers to button colors
// 0 - green
// 1 - red
// 2 - yellow
// 3 - blue
// flash light and sound on the corresponding random button
// user has to click the same flashing button
// check if user clicked the same flashing button
// if not then game falied scenario
// if yes then repeat the same procedure after some delay of 1-2 seconds

var buttonColors = ["green","red","yellow","blue"];
var gamePattern = [];
var userClickedPattern = [];
var level;
var started = false;
var index = 0;

function nextSequence() {
    var randomNumber  = Math.floor(Math.random()*4);
    var randomChosenColor = buttonColors[randomNumber];
    gamePattern.push(randomChosenColor);  
    level += 1;
    console.log("Level: ", level);
    $("#level-title").text("Level " +level);
    playAnimationSound();
}

function playSound(audiofile){
    var sound = new Audio("./sounds/"+audiofile);
    sound.play();
}

function playAnimationSound(){
    var randomButton = gamePattern[gamePattern.length-1];
    console.log(randomButton);
    $("#"+`${randomButton}`).fadeOut(100).fadeIn(100);
    playSound(randomButton+".mp3");
}
function pressedAnimation(clickedButton){
    var clickedBtnId = "#" + clickedButton;
    $(`${clickedBtnId}`).addClass("pressed");
    console.log(clickedButton);
    playSound(clickedButton + ".mp3");
    setTimeout(function() {
        $(`${clickedBtnId}`).removeClass("pressed");
        },200);
}
function playWrongAnimation(){
    $("#level-title").text("Wrong answer, press any key to restart");
    $("body").addClass("game-over");
    playSound("wrong.mp3");
    setTimeout(function() {
        $("body").removeClass("game-over");
        },200);
}

$(document).on("keypress", function(){
      
      if (started === false){ 
        index = 0;
        gamePattern = [];
        level = 0;
        started = true;
        nextSequence();
        }
});
$(".btn").on("click", function (){
    var userclickedButton = $(this).attr("id");
    pressedAnimation(userclickedButton);
    //userClickedPattern.push(userclickedButton);
    if (checkAnswer(userclickedButton) === false)
    {
        playWrongAnimation();
        startOver();
    }
    else {
        if (index >= gamePattern.length){
            
            setTimeout(function (){ 
                //userClickedPattern = []; 
                //console.log("Waiting for 1000ms...")
                index = 0;
                nextSequence();
            }, 1000);
            
        }
    }
   });

function startOver(){
    
    started = false;
}

function checkAnswer(userclickedButton){
    console.log("Index: ", index);
     if (userclickedButton === gamePattern[index]){
        console.log("success");
        console.log(userclickedButton, gamePattern);
        index += 1;
        return true;
     }
     else{
        console.log("wrong");
        return false;
     }

}
