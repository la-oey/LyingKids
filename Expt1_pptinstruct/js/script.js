

function pageLoad() {
    checkWindowDimensionsDynamic(params.minWindowWidth, params.minWindowHeight, false);

    var beforeParamInputs = ["presetup","setup","consent","demographic","start","photobooth","introduction","pickColor"];
    expt.human.color = "red";
    expt.comp.color = "blue";
    colors.teamplayerblink = colors.teamredblink;
    colors.teamopponentblink = colors.teamblueblink;
    $('#leftUpdateBucket').html("<img class='imgPt "+expt.human.color+"Pt "+expt.human.color+"TrialPt' src='img/"+expt.human.color+"point.png' width='100%'><div class='playerScore "+expt.human.color+"Score' id='"+expt.human.color+"UpdateScore'></div>");
    $('#rightUpdateBucket').html("<img class='imgPt "+expt.comp.color+"Pt "+expt.comp.color+"TrialPt' src='img/"+expt.comp.color+"point.png' width='100%'><div class='playerScore "+expt.comp.color+"Score' id='"+expt.comp.color+"UpdateScore'></div>");
    $('#leftUpdateBucketliar').html("<img class='imgPt "+expt.human.color+"Pt "+expt.human.color+"TrialPt' src='img/"+expt.human.color+"point.png' width='100%'><div class='playerScore "+expt.human.color+"Score' id='"+expt.human.color+"UpdateScoreliar'></div>");
    $('#rightUpdateBucketliar').html("<img class='imgPt "+expt.comp.color+"Pt "+expt.comp.color+"TrialPt' src='img/"+expt.comp.color+"point.png' width='100%'><div class='playerScore "+expt.comp.color+"Score' id='"+expt.comp.color+"UpdateScoreliar'></div>");
    $('#leftUpdateBucketdetector').html("<img class='imgPt "+expt.human.color+"Pt "+expt.human.color+"TrialPt' src='img/"+expt.human.color+"point.png' width='100%'><div class='playerScore "+expt.human.color+"Score' id='"+expt.human.color+"UpdateScoredetector'></div>");
    $('#rightUpdateBucketdetector').html("<img class='imgPt "+expt.comp.color+"Pt "+expt.comp.color+"TrialPt' src='img/"+expt.comp.color+"point.png' width='100%'><div class='playerScore "+expt.comp.color+"Score' id='"+expt.comp.color+"UpdateScoredetector'></div>");
    sayAudio.Report = new Audio("audio/say_"+expt.human.color+"_and_"+expt.comp.color+"_marbles.wav");
    sayAudio.Attention = new Audio("audio/say_attention_"+expt.human.color+".wav");

    adaptCSS();
    clicksMap[startPage]();
    console.log("debug: " + expt.debug);    
}

function clickPreSetup() {
    $('#presetup').css('display','none');
    $('#setup').css('display','block');
    checkWindowDimensionsDynamic(params.minWindowWidth, params.minWindowHeight, true);
}

function clickSetup() {
    $('#setup').css('display','none');
    checkWindowDimensionsDynamic(params.minWindowWidth, params.minWindowHeight, false);
    clickTrial();
}




var roletxt;
function clickTrial(){
    // $('#postPractice').css('display','none');
    $('#keep').css('display','block');
    
    $('.sideInstructVid').css('display','none');
    replacePlayerPic();
    if(client.gender == 'f'){
        expt.comp.gender = 'female';
    } else if(client.gender == 'm'){
        expt.comp.gender = 'male';
    } else{
        expt.comp.gender = sample(['male','female']);
    }
    showPlayer(expt.human.color);
    showOpponent(expt.comp.gender,expt.comp.color);


    expt.trialOrder = distributePseudo(expt.trials);
    expt.trialOrder = distributeChecks(expt.trialOrder);
    expt.roleFirst = sample(expt.roles);
    trial.roleCurrent = expt.roleFirst;

    if(trial.roleCurrent == "liar"){
        trial.liarPlayer = expt.human.color;
    } else{
        trial.liarPlayer = expt.comp.color;
    }

    if(trial.roleCurrent == "liar"){
        roletxt = "Marble-Picker"
    } else{
        roletxt = "Decider"
    }
    $('#turnVid').css('display','block');
    let playFunc = function(){};
    let endFunc = function(){
        setTimeout(function(){
            keepTurn();
        }, 1000);
    };
    let resetFunc = function(){};
    loadVideo('start_'+expt.human.color+'_'+ trial.roleCurrent,'turnVid',"instruct", playFunc, endFunc, resetFunc);

    trial.exptPart = "trial";
    trial.trialNumber = 0;
    $('.trialNum').html("Round 1 of "+expt.trials);
    $('#draw-button').prop('disabled',false);
    $('.tubesvg').empty();
    $('.marblesvg').empty();
    $('.sampMarble').css('top', '-80%');

    if(trial.trialNumber == 0 & trial.exptPart == "trial"){
        expt.stat.redTotalScore = 0;
        expt.stat.blueTotalScore = 0;
        expt.stat.redRunningScore = 0;
        expt.stat.blueRunningScore = 0;
        // $('.redScore').animate({
        //     'height': 0
        // }, 500)
        // $('.blueScore').animate({
        //     'height': 0
        // }, 500)
    }
    $('#keepDiv').css('opacity',1);
    $('#humanRole').html(roletxt);
    $('#humanRole').css('color', expt.human.color);
    quickCam();
}


function catchTrial() {
    showOpponentAnim(expt.comp.gender,expt.comp.color,'neutral');
    $('#playerprof').css('box-shadow', "0px 0px 30px 20px " + colors.teamplayerblink);
    $('#opponentprof').css('box-shadow', "");
    $('#trialDrawer').css('display','block');
    $('#nextDrawer').prop('disabled', true);
    $('#nextDrawer').css('opacity',0);
    $('.urn').css('opacity', 0);
    $('.tube').css('opacity', 0);
    
    $('#choices').empty();
    $('#choices').addClass('catchChoice');
    $('#choices').css('opacity',0);
    showChoices();

    $('#nextDrawer').attr('onclick', 'submitCatch();');
    trial.marblesDrawn = [];
    trial.urnRed = 0;
    trial.urnBlue = 0;
    trial.drawnRed = 0;
    trial.drawnBlue = 0;

    trial.startTime = Date.now();
    trial.responseStartTime = Date.now();
}

function liar() {
    showOpponentAnim(expt.comp.gender,expt.comp.color,'neutral');
    $('#playerprof').css('box-shadow', "0px 0px 30px 20px " + colors.teamplayerblink);
    $('#opponentprof').css('box-shadow', "");
    $('#trialDrawer').css('display','block');
    $('#nextDrawer').prop('disabled', true);
    $('#nextDrawer').css('opacity',0);
    $('#draw-button').attr('onclick','draw();');
    sayAudio.ShakeTheBox.currentTime = 0;
    sayAudio.ShakeTheBox.play();
    remindertimer = setInterval(function(){
        blink("draw-button", colors.nextblink, 20, 2, 0);
    }, 10000);
    
    $('.tube').css('top', '68%');
    $('#choices').empty();
    $('#choices').css('opacity',0);
    $('#choices').css('z-index',0);
    $('.cover').css('top', '-10%');
    $('#draw-button').animate({'opacity': 1});
    turn.numDrawn = 0;
    trial.marblesDrawn = [];
    trial.urnRed = 0;
    trial.urnBlue = 0;
    trial.drawnRed = 0;
    trial.drawnBlue = 0;
    trial.roleCurrent = "liar";
    restartTrial();
}

function detector() {
    $('#trialResponder').css('display','block');
    $('#nextResponder').prop('disabled', true);
    trial.roleCurrent = "detector";
    $('.tube').css('top', '15%');
    $('.callout-button').css('opacity','0');
    restartTrial();

    function detectWait() {
        showOpponentAnim(expt.comp.gender,expt.comp.color,'think');
        $('#playerprof').css('box-shadow', "");
        $('#opponentprof').css('box-shadow', "0px 0px 30px 20px " + colors.teamopponentblink);
        flickerWait();
        audioWait();
        
        trial.waitTime = 8000 + 1000*exponential(0.75);
        setTimeout(function(){
            $('#opponentprof').css('box-shadow', "");
            clearInterval(trial.timer);
            clearInterval(trial.audiotimer);

            $('.subjResponse').hide();
            $('.callout-button').css('opacity','0.8');
            if(trial.exptPart == "trial"){
                $('.callout-button').prop('disabled', false);
            }
            computerReport();
            orderTube("detectRep", trial.liarPlayer, trial.reportedDrawn, expt.marbleSize);

            trial.responseStartTime = Date.now();
        }, trial.waitTime);
    }
    detectWait();
}



function trialDone() {

    trial.trialTime = Date.now() - trial.startTime;
    trial.trialNumber += 1;

    if(!trial.catch.on){
        if(!trial.callBS){
            trial.redTrialScore = trial.reportedRed;
            trial.blueTrialScore = trial.reportedBlue;
        } else{
            if(trial.liarPlayer == "red"){
                if(trial.reportedRed == trial.drawnRed){
                    debugLog("truth");
                    trial.redTrialScore = trial.reportedRed;
                    trial.blueTrialScore = trial.reportedBlue - 3;
                } else{
                    debugLog("lie");
                    trial.redTrialScore = 0;
                    trial.blueTrialScore = expt.marblesSampled;
                }
            } else{
                if(trial.reportedBlue == trial.drawnBlue){
                    debugLog("truth");
                    trial.blueTrialScore = trial.reportedBlue;
                    trial.redTrialScore = trial.reportedRed - 3;
                } else{
                    debugLog("lie");
                    trial.blueTrialScore = 0;
                    trial.redTrialScore = expt.marblesSampled;
                }
            }
        }
        expt.stat.redRunningScore += trial.redTrialScore;
        expt.stat.blueRunningScore += trial.blueTrialScore;

        debugLog("marble-picker told truth: " + (trial.reportedRed == trial.drawnRed));
        debugLog("responder accused trick: " + trial.callBS);
        debugLog("red: " + trial.redTrialScore + " | blue: " + trial.blueTrialScore); //EDIT later
        debugLog("red cumulative score: " + (expt.stat.redRunningScore + expt.stat.redTotalScore));
        debugLog("blue cumulative score: " + (expt.stat.blueRunningScore + expt.stat.blueTotalScore));
    } else{
        trial.redTrialScore = 0;
        trial.blueTrialScore = 0;
        expt.stat.redRunningScore += trial.redTrialScore;
        expt.stat.blueRunningScore += trial.blueTrialScore;
    }

    trial.currEndTime = Date.now();
    recordData();

    // start incrementally writing data after each trial, starting at the test trials
    data = {client: client, expt: expt, trials: trialData};
    writeServer(data);
    
    if(expt.human.color == "red"){
        var highlightHuman = colors.teamredblink;
        var highlightComp = colors.teamblueblink;
    } else{
        var highlightHuman = colors.teamblueblink;
        var highlightComp = colors.teamredblink;
    }

    
    if(trial.trialNumber == expt.trials/2){
        if(trial.liarPlayer == 'red'){
            trial.liarPlayer = 'blue';
        } else{
            trial.liarPlayer = 'red';
        }
        if(trial.roleCurrent == "liar"){ //switch roles halfway through
            trial.roleCurrent = "detector";
            var roletxt = "Decider"
            $('#trialDrawer').css('display','none');

        } else{
            trial.roleCurrent = "liar";
            var roletxt = "Marble-Picker";
            $('#trialDrawer').css('display','none');
            $('#trialResponder').css('display','none');
        }
        $('#keep').css('display','block');
        $('#keepDiv').css('opacity',1);

        $('#turnVid').css('display','block');
        var playFunc = function(){};
        var endFunc = function(){
            setTimeout(function(){
                keepTurn();
            }, 1000);
        };
        var resetFunc = function(){};
        loadVideo('switch_'+expt.human.color+'_'+ trial.roleCurrent,'turnVid',"instruct", playFunc, endFunc, resetFunc);
    }

    if(trial.trialNumber%(expt.trials/4) == 0){
        pointsAudio.play();  
        if(trial.trialNumber%(expt.trials/2) != 0){
            sayAudio.Points.play(); //play simultaneously
            // pointsAudio.onended = function(){ //play sequentially
            //     sayAudio.Points.play();
            // }
        }
        if(trial.trialNumber == expt.trials/2){
            addPoints("red", expt.stat.redRunningScore, expt.stat.redTotalScore, "");
            addPoints("blue", expt.stat.blueRunningScore, expt.stat.blueTotalScore, "");
        } else if(trial.catch.on){
            addPoints("red", expt.stat.redRunningScore, expt.stat.redTotalScore, "liar");
            addPoints("blue", expt.stat.blueRunningScore, expt.stat.blueTotalScore, "liar");
        } else{
            addPoints("red", expt.stat.redRunningScore, expt.stat.redTotalScore, trial.roleCurrent);
            addPoints("blue", expt.stat.blueRunningScore, expt.stat.blueTotalScore, trial.roleCurrent);
        }
        
        expt.stat.redTotalScore += expt.stat.redRunningScore;
        expt.stat.blueTotalScore += expt.stat.blueRunningScore;
        expt.stat.redRunningScore = 0;
        expt.stat.blueRunningScore = 0;
        if(trial.trialNumber == expt.trials){
            // $('#keepDiv').hide();
            $('#insideDrawer').css('display','none');
            $('#insideResponder').css('display','none');
            setTimeout(function(){
                toWinnerCircle();
            }, 3000);
        } else if(trial.trialNumber != expt.trials/2){
            setTimeout(function(){
                keepTurn();
            }, 3500); //3000 without Vivian audio
        }
    } else {
        setTimeout(function(){
            keepTurn();
        }, 1000);

    }

    $('#humanRole').html(roletxt);
    $('#humanRole').css('color', expt.human.color);


    if(trial.roleCurrent == "liar"){
        var roletxt = "Marble-Picker"
    } else{
        var roletxt = "Decider"
    }
    
    if(trial.trialNumber == expt.trials){
        $('.trialNum').html("Who won?");
    } else if(trial.trialNumber == (expt.trials/2 + 1)){
        $('.trialNum').html("Round " + (trial.trialNumber+1) + " of " + expt.trials);
    } else{
        $('.trialNum').html("Round " + (trial.trialNumber+1) + " of " + expt.trials + ": <i>" + roletxt + "</i>");
    }

}


  



function writeServer(data){
    $.ajax({
      dataType: 'json',
      type: 'POST',
      url: saveInfo.dataURL,
      data: { data: JSON.stringify(data), 
        experimenter: saveInfo.experimenter,
        experimentName: saveInfo.experimentName},
        success: function(data){
          debugLog('success saving data!');
      },
      error:function(xhr, status, error){
          debugLog('failure saving data');
          debugLog(xhr.responseText);
          debugLog(status);
          debugLog(error);
      }
  });
}

// function writeServer(data){
//     debugLog('initiate server write');
//   $.ajax({
//       dataType: 'json',
//       type: 'POST',
//       url: saveInfo.dataURL,
//       data: { data: JSON.stringify(data)},
//         success: function(data){
//           debugLog('success saving data!');
//         },
//         error:function(xhr, status, error){
//           debugLog('failure saving data');
//           debugLog(xhr.responseText);
//           debugLog(status);
//           debugLog(error);
//         }
//       });
// }

function clickWinner(){
    $('#completed').css('display','none');
    $('.scoreBucket').css('display','none');
    // $('#confirmation').css('display','block');
    $('#debriefing').css('display','block');
    $('#playerprof').css('display','none');
    $('#opponentprof').css('display','none');
}

// function confirmEmail(){
//     submitContact();
//     $('.warning').hide();
//     $('.requiredAns').css({"border":"1px inset gray", "background-color":'white'});
//     if(client.type == "sona" || checkEmail("email")){
//         $('#confirmation').css('display','none');
//         $('#debriefing').css('display','block');
//         client.demographic = demographicClient;
//         data = {client: client, expt: expt, trials: trialData};
//         writeServer(data);
//     } else{
//         $('#email').after('<b class="warning">Please enter a valid email address or "not interested"</b>');
//         $('#email').css({"border":"2px solid red", "background-color":colors.warning});
//     }
    
// }

function experimentDone() {
    $('#debriefing').css('display','none');
    submitExternal(client);
}

function adaptCSS(){
    client.mobile = client.userAgent.includes("iPhone") || client.userAgent.includes("Android");
    client.tablet = !client.mobile & (client.userAgent.includes("iPad") || client.userAgent.includes("CrOS") || client.screen.width <= 1024)

    if(client.tablet){
        $('.color-button').css({'height':'150px'});
        params.minWindowWidth = 0;
        params.minWindowHeight = 0;
    }

    // Errors if using the wrong browser
    if(client.mobile){
        $('#presetupTxt').html('<b>Uh oh!</b> We noticed that you seem to be using a mobile device. To continue with the task, we ask that you please switch to a tablet, laptop, or desktop. Thank you.');
        $('#presetupTxt').append('<br><br>Experiencing problems? Email us at <a href="mailto:MaDlab@ucsd.edu">MaDlab@ucsd.edu</a>.');
        $('#presetupButtonDiv').html('<a href="https://mindanddevlab.ucsd.edu/experiments/trick-or-truth-2/"><button class="big-button active-button" id="continuePreSetup">Return to study info</button></a>');
    } else if((client.userAgent.includes("iPad") || (client.userAgent.includes("Macintosh") & client.screen.width <= 1024)) & client.userAgent.includes("CriOS")){
        $('#presetupTxt').html('<b>Uh oh!</b> We noticed that you seem to be using Google Chrome on an iPad. To continue with the task, we ask that you please switch your browser to Safari. Thank you.');
        $('#presetupTxt').append('<br><br>Experiencing problems? Email us at <a href="mailto:MaDlab@ucsd.edu">MaDlab@ucsd.edu</a>.');
        $('#presetupButtonDiv').html('<a href="https://mindanddevlab.ucsd.edu/experiments/trick-or-truth-2/"><button class="big-button active-button" id="continuePreSetup">Return to study info</button></a>');
    } else if(client.tablet){
        $('#presetupTxt').append('<br><br>Please keep your tablet in landscape mode. Thanks!<br><br><img src="img/rotateIpad.gif">');
        checkOrientation();
    }
}