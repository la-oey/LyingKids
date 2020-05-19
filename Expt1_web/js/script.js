var saveInfo = {
    dataURL: 'https://madlab.ucsd.edu/mturk/save.json.php', //'save.json.php'
    //videoURL: 'submit.video.php',
    imgURL: 'https://madlab.ucsd.edu/mturk/save.image.php', //'save.image.php'
    experimenter: 'loey',
    experimentName: 'trick-or-truth-2'
}


// experiment settings
var expt = {
    trials: 2, //switched from 100
    marblesSampled: 6, //total number of marbles drawn per trial
    numPerDrawn: 2,
    marbleSize: 15,
    roles: ['liar', 'detector'],
    roleFirst: ['liar', 'detector'],
    humanColor: ['red', 'blue'],
    compColor: ['red', 'blue'],
    allTrialProbs: [0.5],//[0.2,0.5,0.8],
    pseudo: [],
    choiceArr: "oneRow",
    catchTrials: [],
    stat: {
        redTotalScore: 0,
        blueTotalScore: 0,
        redRunningScore: 0,
        blueRunningScore: 0
    },
    // sona: {
    //     experiment_id: 1505,
    //     credit_token: 'b20092f9d3b34a378ee654bcc50710ea'
    // },
    debug: false
};
var trial = {
    exptPart: 'instruct', //parts: {'instruct', 'practice','trial'}
    roleCurrent: 'liar',
    liarPlayer: 'red', // {red, blue} ~ player1 vs player2
    trialNumber: 0,
    pseudo: false,
    startTime: 0,
    trialTime: 0,
    responseStartTime: 0,
    responseTime: 0,
    currEndTime: 0,
    timer: 0,
    probabilityRed: 0.5,
    probabilityBlue: 0.5,
    marblesDrawn: [],
    urnRed: 0,
    urnBlue: 0,
    drawnRed: 0,
    drawnBlue: 0,
    highlightedDrawn: 0,
    reportedDrawn: 0,
    reportedRed: 0,
    reportedBlue: 0,
    compLie: 0,
    compUnifLie: false,
    compDetect: 0,
    callBS: false,
    callBStxt: '',
    catch: {
        question: '',
        response: 0,
        key: 0,
        responseStartTime: 0,
        responseTime: 0
    },
    redTrialScore: 0,
    blueTrialScore: 0
};
var turn = {
    numDrawn: 0,
    practiceOrder: 'NA'
}
var client = parseClient();
var trialData = []; // store of all trials
// var instruct = [
//     {id:"instructImg0", src:"img/marblebox.png"},
//     {id:"instructImg1", src:"img/marblebox.png"},
//     {id:"instructImg2", src:"img/redblueteam.png"},
//     {id:"instructImg3", src:"img/trick.png"},
//     {id:"instructImg4", src:"img/redblueaccept.png"},
//     {id:"instructImg5", src:"img/redblueaccept.png"},
//     {id:"instructImg6", src:"img/redbluecatch.png"},
//     {id:"instructImg7", src:"img/redbluecatch.png"},
//     {id:"instructImg8", src:"img/redblueaccus.png"},
//     {id:"instructImg9", src:"img/redblueaccus.png"}
// ]
var yaAudio, noAudio, dropAudio, dropAudio2, shakeAudio, winnerAudio;
var colors = {
    nextblink: "#82ec8e", //light green
    camblink: "#42BBE2", //light blue
    teamredblink: "#ffcccb",
    teamblueblink: "#add8e6",
    funcblink: "yellow",
    truthblink: "#6b8e23", //light forest green
    trickblink: "#f59c49" //light orange
}
var data = [];



function pageLoad() {
    $('#start').css('display','block');
    console.log("debug: " + expt.debug);
    
    // if(!expt.debug){
    //     turnOnVideoCamera();
    // }

    //preload video and audio files
    //preloadVideo("color","colorVid");
    preloadVideo("screen","screenVid");
    preloadVideo("summary","summaryVid");
    preloadVideo("shake","practiceVid");
    yaAudio = new Audio("audio/correct.wav");
    noAudio = new Audio("audio/incorrect.wav");
    dropAudio = new Audio("audio/drop.wav");
    dropAudio2 = new Audio("audio/drop.wav");
    shakeAudio = new Audio('audio/shake.wav');
    winnerAudio = new Audio('audio/winner.wav');

    blink("letsgo", colors.nextblink, 20, 2, 3000, true);

}

function clickStart() {
    $('#start').css('display','none');
    $('#photobooth').css('display','block');

    trial.startTime = Date.now();
    showCam();
    setupCam();
    
    $('#continuePicture').prop('disabled',true);
    blink("clickclick", colors.camblink, 20, 2, 3000, true);
    $('#clickclick').click(function(){
        $('#clickclick').prop('disabled',true);
        $('#continuePicture').prop('disabled',false);
        blink("continuePicture", colors.nextblink, 20, 2, 3000, true);
    })
}

function clickPicture() {
    expt.trialProbs = sample(expt.allTrialProbs);
    //expt.humanColor = sample(expt.humanColor); //assigns human to play as red or blue
    
    $('#photobooth').css('display','none');
    $('#pickColor').css('display','block');
    $('#thecamera').css('display','none');
    $('#clickclick').css('display','none');
    replacePlayerPic();

    loadVideo("color","colorVid");
    //playVideo("colorVid");

    //loadVideo("color","colorVid")

    blink('red-button', colors.teamredblink, 20, 2, getEventTime('color','red_team'));
    blink('blue-button', colors.teamblueblink, 20, 2, getEventTime('color','blue_team'));
    
    
    if(!expt.debug){
        $('.color-button').prop('disabled',true);
        $('#continueColor').prop('disabled',true);
    }
    
    document.getElementById("colorVid").onended = function(){
        $('#colorVid').css('filter','brightness(0)');
        $('.color-button').prop('disabled',false);
        $('.color-button').css('opacity',0.8);
    }
}

function pickCol(color){
    if(color == 'red'){
        $('#red-button').css('opacity','1');
        $('#blue-button').css('opacity','0.4');
        expt.humanColor = "red";
        expt.compColor = "blue";
    } else{
        $('#blue-button').css('opacity','1');
        $('#red-button').css('opacity','0.4');
        expt.humanColor = "blue";
        expt.compColor = "red";
    }

    // INSTRUCT ANIMATIONS
    if(!expt.debug){
        $('.color-button').prop('disabled',true);
    }
    document.getElementById("colorVid").onended = function(){
        $('#colorVid').css('filter','brightness(0)');
        $('#continueColor').prop('disabled',false);
        blink('continueColor', colors.nextblink, 20, 2, 0, true);
    }
    
    var opponent_vid = "opponent_"+expt.humanColor;
    loadVideo(opponent_vid,"colorVid");
    setTimeout(function(){
    	showPlayer(expt.humanColor);
    }, getEventTime(opponent_vid, 'player_team'));
    setTimeout(function(){
    	showOpponent("female",expt.compColor); //EDIT gender after demographic form
    }, getEventTime(opponent_vid, 'opponent_team'));
    
}

function clickColor() {
    pauseVideo("colorVid");
    $('#pickColor').css('display','none');
    $('#instructions').css('display','block');
    playVideo("screenVid");
    //INSTRUCT ANIMATIONS
    if(!expt.debug){
        $('#continueInstruct').prop('disabled',true);
    }
    document.getElementById("screenVid").onended = function(){
        $('#continueInstruct').prop('disabled',false);
        blink('continueInstruct', colors.nextblink, 20, 2, 0, true);
    }
}


function clickInstruct() {
	//document.getElementById("howtoVid").pause();
    pauseVideo("screenVid");
    $('#instructions').css('display','none');
    $('.tube').show();
    $('.tubesvg').empty();
    $('.marblesvg').empty();
    $('.sampMarble').css('top', '-80%');
    trial.exptPart = "practice";

    //document.getElementById('keep').style.display = 'block';
    keepTurn();
    trial.liarPlayer = expt.humanColor;
    $('#liarplayer').html(trial.liarPlayer);
    $('#liarplayer').css('color', trial.liarPlayer);
    $('.trialNum').html("Practice: <i>Marble-Picker</i>");
    $('.redScore').css('height', 0);
    $('.blueScore').css('height', 0);
    quickCam();
    $('#practiceVid').css('display','block');

    //INSTRUCT ANIMATIONS
    playVideo("practiceVid");
    $('#draw-button').prop('disabled',true);
    
    $('.choiceClass').attr('onclick', '');
    setTimeout(function(){
        blink('draw-button', colors.nextblink, 20, 2, 0, true);
        $('#draw-button').prop('disabled',false);
        pauseVideo("practiceVid", getEventTime('shake', 'shake_pause') - getEventTime('shake','shake_button'));
    }, getEventTime('shake', 'shake_button'));

    $('#draw-button').click(function(){
        playVideo("practiceVid");
        var sampleTime = getEventTime('shake','sample') - getEventTime('shake', 'shake_pause');
        blink('tube1', colors.funcblink, 30, 2, sampleTime);
        var choiceTime = getEventTime('shake','choices') - getEventTime('shake', 'shake_pause');
        for(var i=0; i<=6; i++){
            blink('choice'+i+'img', colors.funcblink, 30, 2, choiceTime);
        }

        var mostTime = getEventTime('shake','most_red') - getEventTime('shake', 'shake_pause');
        
        setTimeout(function(){
            pauseVideo("practiceVid");
            resetHighlight();
        }, mostTime);
    });





}

function clickPostPractice(){
    $('#postPractice').css('display','none');
    $('#keep').css('display','block');
    $('.practiceVid').hide()

    //expt.catchTrials = distributeChecks(expt.trials, 0.10); // 0.1 of expt trials have an attention check
    expt.pseudo = distributePseudo(expt.trials);
    expt.roleFirst = sample(expt.roles);
    trial.roleCurrent = expt.roleFirst;

    if(trial.roleCurrent == "liar"){
        trial.liarPlayer = expt.humanColor;
    } else{
        trial.liarPlayer = expt.compColor;
    }

    if(trial.roleCurrent == "liar"){
        var roletxt = "Marble-Picker"
    } else{
        var roletxt = "Decider"
    }
    trial.exptPart = "trial";
    trial.trialNumber = 0;
    $('.trialNum').html("Round 1: <i>" + roletxt + "</i>");
    $('.tubesvg').empty();
    $('.marblesvg').empty();
    $('.sampMarble').css('top', '-80%');
    $('#practiceOppDecision').hide();

    if(trial.trialNumber == 0 & trial.exptPart == "trial"){
        expt.stat.redTotalScore = 0;
        expt.stat.blueTotalScore = 0;
        expt.stat.redRunningScore = 0;
        expt.stat.blueRunningScore = 0
        $('.redScore').animate({
            'height': 0
        }, 500)
        $('.blueScore').animate({
            'height': 0
        }, 500)
    }
    $('#keepDiv').css('opacity',1);
    $('#liarplayer').html(trial.liarPlayer);
    $('#liarplayer').css('color', trial.liarPlayer);
    quickCam();
}




function liar() {
    $('#trialDrawer').css('display','block');
    $('#nextDrawer').prop('disabled', true);
    $('#nextDrawer').css('opacity',0);
    $('#draw-button').attr('onclick','draw();');
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
    trial.roleCurrent = "liar"
    restartTrial();
}

function detector() {
    $('#trialResponder').css('display','block');
    
    $('#nextResponder').prop('disabled', true);
    trial.roleCurrent = "detector";
    $('.tube').css('top', '15%');
    $('.subjResponse').css('opacity','1');
    $('.callout-button').css('opacity','0');
    
    function detectWait() {
        flickerWait();
        
        trial.waitTime = 8000 + 1000*exponential(0.75);
        setTimeout(function(){
            clearInterval(trial.timer);
            $('.subjResponse').css('opacity','0');
            computerReport();
            orderTube("detectRep", trial.liarPlayer, trial.reportedDrawn, expt.marbleSize);
            $('.callout-button').css('opacity','0.8');
            $('.callout-button').prop('disabled', false);
            // if(trial.exptPart == "practice"){ //previously blocked from clicking accept
            //     $('#accept-button').prop('disabled', true);
            // }
            trial.responseStartTime = Date.now();
        }, trial.waitTime);
    }
    detectWait();
}


function trialDone() {
    $('#keep').css('display','block');
    $('#keepDiv').css('opacity',0);
    $('#nextKeep').prop('disabled',true);
    quickCam();

    trial.trialTime = Date.now() - trial.startTime;
    trial.trialNumber += 1;

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


    if(trial.exptPart == "trial" & trial.trialNumber%5 == 0){
        addPoints("red", expt.stat.redRunningScore, expt.stat.redTotalScore);
        addPoints("blue", expt.stat.blueRunningScore, expt.stat.blueTotalScore);
        expt.stat.redTotalScore += expt.stat.redRunningScore;
        expt.stat.blueTotalScore += expt.stat.blueRunningScore;
        expt.stat.redRunningScore = 0;
        expt.stat.blueRunningScore = 0;
    } else if(trial.exptPart == "practice"){
        addPoints("red", trial.redTrialScore, expt.stat.redRunningScore-trial.redTrialScore);
        addPoints("blue", trial.blueTrialScore, expt.stat.blueRunningScore-trial.blueTrialScore);
    } else{
        setTimeout(function(){
            $('#nextKeep').prop('disabled',false);
        }, 1000);
    }

    trial.currEndTime = Date.now();
    recordData();

    // start incrementally writing data after each trial, starting at the test trials
    if(trial.exptPart == "trial"){
        data = {client: client, expt: expt, trials: trialData};
        writeServer(data);
    }
    

    if(trial.exptPart == "practice"){
        if(expt.humanColor == "red"){
            var highlightHuman = colors.teamredblink;
            var highlightComp = colors.teamblueblink;
        } else{
            var highlightComp = colors.teamblueblink;
            var highlightHuman = colors.teamredblink;
        }
        if(trial.roleCurrent == "liar"){
            //INSTRUCT ANIMATIONS
            var oppAllPts = getEventTime('decide','opponent_allpoints') - getEventTime('decide','lie_pause'); 
            blink("rightUpdateBucket", highlightComp, 40, 2, oppAllPts);
            var plaNoPts = getEventTime('decide','player_nopoints') - getEventTime('decide','lie_pause'); 
            blink("leftUpdateBucket", highlightHuman, 40, 2, plaNoPts);
            var pointsNext = getEventTime('decide','points_next') - getEventTime('decide','lie_pause'); 
            //var pointsPause = getEventTime('decide','points_pause') - getEventTime('decide','lie_pause'); 
            
            setTimeout(function(){
                blink("nextKeep", colors.nextblink, 20, 2, 0, true);
                $('#nextKeep').prop('disabled',false);
                pauseVideo("practiceVid", getEventTime('decide','points_pause') - getEventTime('decide','points_next'));
            }, pointsNext);
            
            trial.liarPlayer = expt.compColor;
            trial.roleCurrent = "detector";
            $('#practiceOppDecision').show();
            
        } else{
            if(trial.callBS){
                $('#practiceOppDecision').html("<center><img src='img/thumbs-up.png' height='200'/><br><p>You caught them!</p></center>");
                loadVideo("prompt_trick","practiceVid");
            } else{
                $('#practiceOppDecision').html("<center><img src='img/thumbs-down.png' height='200'/><br><p>They tricked you!</p></center>");
                loadVideo("prompt_truth","practiceVid");
            }
            document.getElementById('practiceVid').onended = function(){
                $('#practiceVid').css('filter','brightness(0)');
                blink("nextKeep", colors.nextblink, 20, 2, 0, true);
                $('#nextKeep').prop('disabled',false);
            }

        }
        
    } else if(trial.trialNumber == expt.trials){
        $('#keepDiv').hide();
        $('#nextKeep').attr('onclick','toWinnerCircle();');
    } else {
        if(trial.trialNumber == expt.trials/2){
            if(trial.liarPlayer == 'red'){
                trial.liarPlayer = 'blue';
            } else{
                trial.liarPlayer = 'red';
            }
            if(trial.roleCurrent == "liar"){ //switch roles halfway through
                trial.roleCurrent = "detector";
            } else{
                trial.roleCurrent = "liar";
            }
            $('#keepDiv').css('opacity',1);
        }
        $('#liarplayer').html(trial.liarPlayer);
        $('#liarplayer').css('color', trial.liarPlayer);
        
    }

    if(trial.roleCurrent == "liar"){
        var roletxt = "Marble-Picker"
    } else{
        var roletxt = "Decider"
    }
    
    if(trial.exptPart == "practice"){
        $('.trialNum').html("Practice: <i>" + roletxt + "</i>");
    } else if((trial.trialNumber+1) == 21){
    	$('.trialNum').html("End!");
    } else{
        $('.trialNum').html("Round " + (trial.trialNumber+1) + ": <i>" + roletxt + "</i>");
    }

}


  



function writeServer(data){
    if(!expt.debug){
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
}

function writeImgServer(data){
    if(!expt.debug){
        $.ajax({
            type: "POST",
            url: saveInfo.imgURL,
            data: { img: data, 
                name: client.sid,
                experimenter: saveInfo.experimenter,
                experimentName: saveInfo.experimentName},
            }).done(function(o) {
               console.log('saved'); 
           })
        }
    }

