var saveInfo = {
    dataURL: 'save.json.php', // 'https://madlab.ucsd.edu/mturk/save.json.php', //
    //videoURL: 'submit.video.php',
    imgURL: 'save.image.php', // 'https://madlab.ucsd.edu/mturk/save.image.php', //
    experimenter: 'loey',
    experimentName: 'trick-or-truth-2'
}

var params = {
    minAge: 3,
    maxAge: 12,
    minWindowWidth: 980,
    minWindowHeight: 634
}

// experiment settings
var expt = {
    trials: 10, //switched from 100
    marblesSampled: 6, //total number of marbles drawn per trial
    numPerDrawn: 2,
    marbleSize: 15,
    roles: ['liar', 'detector'],
    roleFirst: ['liar', 'detector'],
    humanColor: ['red', 'blue'],
    compColor: ['red', 'blue'],
    trialProbs: 0.5,//[0.2,0.5,0.8],
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
    debug: false // false //
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
    audiotimer: 0,
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
var blinktimer = null;
var replaytimer = null;
var remindertimer = null;
var yaAudio, noAudio, dropAudio, dropAudio2, chooseAudio, pointsAudio, shakeAudio, winnerAudio;
var colors = {
	warning: "#ffb3b3", //light red
    nextblink: "#82ec8e", //light green
    camblink: "#42BBE2", //light blue
    teamredblink: "#ffcccb",
    teamblueblink: "#add8e6",
    funcblink: "yellow",
    truthblink: "#6b8e23", //light forest green
    trickblink: "#f59c49", //light orange
    teamplayerblink: null,
    teamopponentblink: null
}
var data = [];


function pageLoad() {
    yaAudio = new Audio("audio/correct.wav");
    noAudio = new Audio("audio/incorrect.wav");
    dropAudio = new Audio("audio/drop.wav");
    dropAudio2 = new Audio("audio/drop.wav");
    waitAudio = new Audio("audio/wait.wav");
    chooseAudio = new Audio("audio/choose.wav");
    pointsAudio = new Audio("audio/points.wav");
    shakeAudio = new Audio('audio/shake.wav');
    winnerAudio = new Audio('audio/winner.wav');

    var startPage = "photobooth";
    var beforeParamInputs = ["presetup","setup","consent","demographic","start","photobooth","introduction","pickColor"];
    if(!beforeParamInputs.includes(startPage)){
        expt.humanColor = "blue";
        expt.compColor = "red";
        colors.teamplayerblink = colors.teamblueblink;
        colors.teamopponentblink = colors.teamredblink;
        $('#leftUpdateBucket').html("<img class='imgPt bluePt blueTrialPt' src='img/bluepoint.png' width='100%'><div class='playerScore blueScore' id='blueUpdateScore'></div>");
        $('#rightUpdateBucket').html("<img class='imgPt redPt redTrialPt' src='img/redpoint.png' width='100%'><div class='playerScore redScore' id='redUpdateScore'></div>");
        $('.leftStaticBucket').html("<img class='imgPt bluePt blueTrialPt' src='img/bluepoint.png' width='100%'><div class='playerScore blueScore'></div>");
        $('.rightStaticBucket').html("<img class='imgPt redPt redTrialPt' src='img/redpoint.png' width='100%'><div class='playerScore redScore'></div>");
        $('.scoreboardDiv').html("<div class='scoreCol' style='color:blue'>Blue Score:<br><b class='blueFinalScore'>0</b></div><div class='scoreCol' style='color:red'>Red Score:<br><b class='redFinalScore'>0</b></div>");
    }
    clicksMap[startPage]();
	console.log("debug: " + expt.debug);	
}

function clickPreSetup() {
    $('#presetup').css('display','none');
    $('#setup').css('display','block');
    checkWindowDimensionsDynamic(params.minWindowWidth, params.minWindowHeight);
}

function clickSetup() {
    $('#setup').css('display','none');
    $('#consent').css('display','block');
}

function clickConsent() {
    let minAge = params.minAge;
    let maxAge = params.maxAge;
    submitConsent();
    $('.warning').hide();
    $('.requiredAns').css({"border":"1px inset gray", "background-color":'white'});
	if(checkCheckbox("checkconsent") & checkDOB("DOB",3,12)){
		$('#consent').css('display','none');
		$('#demographic').css('display','block');
        window.scrollTo(0, 0);

        //saves client data from 1st page of consent
        client.demographic = demographicClient;
        data = {client: client, expt: expt, trials: trialData};
        writeServer(data);
	} else{
		if(!checkCheckbox("checkconsent")){
			$('#checkconsentLabel').append("<b class='warning'>Please accept to continue</b>");
			$('#checkconsent').css({"border":"2px solid red", "background-color":colors.warning});
		}
        if(!checkText("DOB","")){
            $('#DOB').after("<b class='warning'> Please enter a valid date</b>");
            $('#DOB').css({"border":"2px solid red", "background-color":colors.warning});
        } else if(!checkDOB("DOB", minAge, maxAge)){
			$('#DOB').after("<b class='warning'> Child participants must be between the ages of " + minAge + " and " + maxAge + "</b>");
			$('#DOB').css({"border":"2px solid red", "background-color":colors.warning});
		}
	}
}

function clickDemo() {
    submitDemo();
    $('.warning').hide();
    $('.requiredAns').css({"border":"1px inset gray", "background-color":'white'});
    if(checkRadio("videotaping")){
        $('#demographic').css('display','none');
        $('#start').css('display','block');
        window.scrollTo(0, 0);
        blink("letsgo", colors.nextblink, 20, 2, 3000, true);

        //saves client data from 2nd page of consent
        client.demographic = demographicClient;
        data = {client: client, expt: expt, trials: trialData};
        writeServer(data);
    } else{
        $('#videotapingLabel').after("<b class='warning'> Please select one</b>");
    }
}

function clickStart() {
    $('#start').css('display','none');
    $('#clickclick').prop('disabled',true);

    if(demographicClient.videotaping == "yes"){
        $('#photobooth').css('display','block');

        trial.startTime = Date.now();
        showCam();
        setupCam();
        camLoadWait = setInterval(function(){ //checks if camera is loaded every 500 ms, then takes picture
            if(Webcam.loaded){
                $('#clickclick').prop('disabled',false);
            }
        }, 500);
        
        $('#continuePicture').prop('disabled',true);
        blink("clickclick", colors.camblink, 20, 2, 1000, true);
        $('#clickclick').click(function(){
            $('#clickclick').prop('disabled',true);
            $('#continuePicture').prop('disabled',false);
            blink("continuePicture", colors.nextblink, 20, 2, 3000, true);
        })
    } else{
        
        replacePlayerPic();
        continueToIntro();
    }
    
}

function clickPicture() {
    //expt.trialProbs = sample(expt.allTrialProbs);
    //expt.humanColor = sample(expt.humanColor); //assigns human to play as red or blue
    
    $('#photobooth').css('display','none');
    $('#thecamera').css('display','none');
    $('#clickclick').css('display','none');
    replacePlayerPic();
    if(!expt.debug){
        $('#continueIntro').prop('disabled',true);
    }
    continueToIntro();
}

function continueToIntro(){
    $('#introduction').css('display','block');
    
    var playFunc = function(){};
    var endFunc = function(){
        $('#continueIntro').prop('disabled',false);
        blink('continueIntro', colors.nextblink, 20, 2, 0, true);
    };
    var resetFunc = function(){
        $('#continueIntro').prop('disabled',true);
        clearInterval(blinktimer);
    };

    loadVideo("intro","introVid","instruct", playFunc, endFunc, resetFunc);
}

function clickIntro() {
    pauseVideo("introVid");
    $('#introduction').css('display','none');
    $('#pickColor').css('display','block');

    if(!expt.debug){
        $('.color-button').prop('disabled',true);
        $('#continueColor').prop('disabled',true);
    }

      /////////////////
     /// animation ///
    /////////////////

    var playFunc = function(){
        var currVideo = document.getElementById('colorVid');
        var timer0 = new Timer(function(){
            blink('red-button', colors.teamredblink, 20, 2, 0);
        }, getEventTime('color','red_team'));
        var timer1 = new Timer(function(){
            blink('blue-button', colors.teamblueblink, 20, 2, 0);
        }, getEventTime('color','blue_team'));

        currVideo.onpause = function(){
            timer0.pause();
            timer1.pause();
        }
        currVideo.onplay = function(){
            if(currVideo.currentTime == 0){
                timer0.reset();
                timer1.reset();
            }
            timer0.resume();
            timer1.resume();
        }
    };

    var endFunc = function(){
        $('.color-button').prop('disabled',false);
        $('.color-button').css('opacity',0.8);
    };

    var resetFunc = function(){
        $('.color-button').prop('disabled',true);
        $('.color-button').css('opacity',0.6);
    };

    loadVideo("color","colorVid","instruct", playFunc, endFunc, resetFunc);
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
    
    if(expt.humanColor == 'red'){
    	colors.teamplayerblink = colors.teamredblink;
    	colors.teamopponentblink = colors.teamblueblink;
    } else{
    	colors.teamplayerblink = colors.teamblueblink;
    	colors.teamopponentblink = colors.teamredblink;
        $('#leftUpdateBucket').html("<img class='imgPt bluePt blueTrialPt' src='img/bluepoint.png' width='100%'><div class='playerScore blueScore' id='blueUpdateScore'></div>");
        $('#rightUpdateBucket').html("<img class='imgPt redPt redTrialPt' src='img/redpoint.png' width='100%'><div class='playerScore redScore' id='redUpdateScore'></div>");
        $('.leftStaticBucket').html("<img class='imgPt bluePt blueTrialPt' src='img/bluepoint.png' width='100%'><div class='playerScore blueScore'></div>");
        $('.rightStaticBucket').html("<img class='imgPt redPt redTrialPt' src='img/redpoint.png' width='100%'><div class='playerScore redScore'></div>");
        $('.scoreboardDiv').html("<div class='scoreCol' style='color:blue'>Blue Score:<br><b class='blueFinalScore'>0</b></div><div class='scoreCol' style='color:red'>Red Score:<br><b class='redFinalScore'>0</b></div>")
    }

      /////////////////
     /// animation ///
    /////////////////
    
    var playFunc = function(){
        var opponent_vid = "opponent_"+expt.humanColor;
        var currVideo = document.getElementById('colorVid');
        var timer0 = new Timer(function(){
            showPlayer(expt.humanColor);
            blink('playerprof', colors.teamplayerblink, 20, 2, 0);
        }, getEventTime(opponent_vid, 'player_team'));

        if(demographicClient.gender == 'other' || demographicClient.gender == null){
            var opponentGender = sample(['male','female']);
        } else if(demographicClient.gender != ''){
            var opponentGender = demographicClient.gender;
        } else{
            var opponentGender = 'female';
        }
        var timer1 = new Timer(function(){
            showOpponent(opponentGender,expt.compColor, true); //EDIT gender after demographic form
        }, getEventTime(opponent_vid, 'other_player'));
        var timer2 = new Timer(function(){
            showOpponent(opponentGender,expt.compColor); //EDIT gender after demographic form //include other option
            blink('opponentprof', colors.teamopponentblink, 20, 2, 0);
        }, getEventTime(opponent_vid, 'opponent_team'));
        var timer3 = new Timer(function(){
            $('#continueColor').prop('disabled',false);
            blink('continueColor', colors.nextblink, 20, 2, 0, true);
        }, getEventTime(opponent_vid, 'opponent_button'));

        currVideo.onpause = function(){
            timer0.pause();
            timer1.pause();
            timer2.pause();
            timer3.pause();
        }
        currVideo.onplay = function(){
            if(currVideo.currentTime == 0){
                timer0.reset();
                timer1.reset();
                timer2.reset();
                timer3.reset();
            }
            timer0.resume();
            timer1.resume();
            timer2.resume();
            timer3.resume();
        }
    };
    var endFunc = function(){};
    var resetFunc = function(){
        showPlayer('black');
        $('#opponentprof').css('display','none');
        $('#continueColor').prop('disabled',true);
        clearInterval(blinktimer);
    };

    var opponent_vid = "opponent_"+expt.humanColor;
    loadVideo(opponent_vid,"colorVid","instruct", playFunc, endFunc, resetFunc);    
}

function clickColor() {
    pauseVideo("colorVid");
    $('#pickColor').css('display','none');
    $('#instructions').css('display','block');
    if(!expt.debug){
    	$('#continueInstruct').css('display','none');
    }
    $('.bottomCoverFullInstruct').css('display','none');

    var playFunc = function(){
        var currVideo = document.getElementById('screenVid');
        var timer0 = new Timer(function(){
            $('.bottomCoverFullInstruct').css('display','block');
        }, getEventTime('screenRecord', 'hide_button'));

        currVideo.onpause = function(){
            timer0.pause();
        }
        currVideo.onplay = function(){
            if(currVideo.currentTime == 0){
                timer0.reset();
            }
            timer0.resume();
        }
    };
    var endFunc = function(){
        $('#continueInstruct').css('display','block');
        //$('#continueInstruct').prop('disabled',false);
        blink('continueInstruct', colors.nextblink, 20, 2, 0, true);
    };
    var resetFunc = function(){
        $('.bottomCoverFullInstruct').css('display','none');
        //$('#continueInstruct').css('display','none'); //this one I'm having that participants can skip ahead whenever?
        clearInterval(blinktimer);
    };   

    loadVideo("screenRecord_"+expt.humanColor,"screenVid","fullInstruct", playFunc, endFunc, resetFunc);
}

function clickInstruct() {
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
    $('#practiceViddiv').css('display','block');
    $('.choiceClass').attr('onclick', '');

    if(expt.debug){
        $('#nextDrawer').prop('disabled', false);
    }
    $('#draw-button').prop('disabled',true);

    var playFunc = function(){
        var currVideo = document.getElementById('practiceVid');
        var timer0 = new Timer(function(){
            blink('draw-button', colors.nextblink, 20, 2, 0, true);
            $('#draw-button').prop('disabled',false);
        }, getEventTime('shake_shakebutton', 'shake_button'));

        currVideo.onpause = function(){
            timer0.pause();
        }
        currVideo.onplay = function(){
            if(currVideo.currentTime == 0){
                timer0.reset();
            }
            timer0.resume();
        }
    };
    var endFunc = function(){};
    var resetFunc = function(){
        $('#draw-button').prop('disabled',true);
        clearInterval(blinktimer);
    };

    //INSTRUCT ANIMATIONS
    loadVideo("shake_shakebutton","practiceVid","sideInstruct", playFunc, endFunc, resetFunc);
    
    $('#draw-button').click(function(){
        if(trial.exptPart == "practice"){
            practiceDraw();
        }
    });

    var practiceDraw = function(){
        $('.replayButton').css('display','none');
        var delayTime = 5000;
        setTimeout(function(){
            var playFunc = function(){
                var currVideo = document.getElementById('practiceVid');
                var timer0 = new Timer(function(){
                    blink('tube1', colors.funcblink, 30, 2, 0);
                }, getEventTime('shake_all','sample'));

                var timer1 = new Timer(function(){
                    for(var i=0; i<=6; i++){
                        blink('choice'+i+'img', colors.funcblink, 30, 2, 0);
                    }
                }, getEventTime('shake_all','choices'));

                var timer2 = new Timer(function(){
                    resetHighlight();
                }, getEventTime('shake_all','question'));

                currVideo.onpause = function(){
                    timer0.pause();
                    timer1.pause();
                    timer2.pause();
                }
                currVideo.onplay = function(){
                    if(currVideo.currentTime == 0){
                        timer0.reset();
                        timer1.reset();
                        timer2.reset();
                    }
                    timer0.resume();
                    timer1.resume();
                    timer2.resume();
                }
            };
            var endFunc = function(){
                var currVideo = document.getElementById('practiceVid');
                $('#practiceVid').attr('onplay','');
                replaytimer = setInterval(function(){
                    loadVideo('shake_all_'+expt.humanColor+'_again', 'practiceVid','sideInstruct', null, null, null);
                }, 20000);
            };
            var resetFunc = function(){};
            
            loadVideo("shake_all_"+expt.humanColor,"practiceVid","sideInstruct", playFunc, endFunc, resetFunc);
        }, delayTime);
        $('#draw-button').prop('disabled',true);
    }
}

function clickPostPractice(){
    $('#postPractice').css('display','none');
    $('#keep').css('display','block');
    
    $('.sideInstructVid').css('display','none');


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
    $('#turnVid').css('display','block');
    if(!expt.debug){
        $('#nextKeep').prop('disabled',true);
    }
    var playFunc = function(){};
    var endFunc = function(){
        $('#nextKeep').prop('disabled',false);
    };
    var resetFunc = function(){
        $('#nextKeep').prop('disabled',true);
    };
    loadVideo('start_'+expt.humanColor+'_'+ trial.roleCurrent,'turnVid',"instruct", playFunc, endFunc, resetFunc);
    trial.exptPart = "trial";
    trial.trialNumber = 0;
    $('.trialNum').html("Round 1 of "+expt.trials);
    $('#draw-button').prop('disabled',false);
    $('.tubesvg').empty();
    $('.marblesvg').empty();
    $('.sampMarble').css('top', '-80%');
    $('#practiceOppDecision').hide();

    if(trial.trialNumber == 0 & trial.exptPart == "trial"){
        expt.stat.redTotalScore = 0;
        expt.stat.blueTotalScore = 0;
        expt.stat.redRunningScore = 0;
        expt.stat.blueRunningScore = 0;
        $('.redScore').animate({
            'height': 0
        }, 500)
        $('.blueScore').animate({
            'height': 0
        }, 500)
    }
    $('#keepDiv').css('opacity',1);
    $('#humanRole').html(roletxt);
    $('#humanRole').css('color', expt.humanColor);
    quickCam();
}




function liar() {
    $('#playerprof').css('box-shadow', "0px 0px 30px 20px " + colors.teamplayerblink);
    $('#opponentprof').css('box-shadow', "");
    $('#trialDrawer').css('display','block');
    $('#nextDrawer').prop('disabled', true);
    $('#nextDrawer').css('opacity',0);
    $('#draw-button').attr('onclick','draw();');
    if(trial.exptPart == "trial"){
        remindertimer = setInterval(function(){
            blink("draw-button", colors.nextblink, 20, 2, 0);
        }, 10000);
    }
    
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
        $('#playerprof').css('box-shadow', "");
        $('#opponentprof').css('box-shadow', "0px 0px 30px 20px " + colors.teamopponentblink);
        flickerWait();
        audioWait();
        
        trial.waitTime = 8000 + 1000*exponential(0.75);
        setTimeout(function(){
            $('#opponentprof').css('box-shadow', "");
            clearInterval(trial.timer);
            clearInterval(trial.audiotimer);

            $('.subjResponse').css('opacity','0');
            orderTube("detectRep", trial.liarPlayer, trial.reportedDrawn, expt.marbleSize);
            $('.callout-button').css('opacity','0.8');
            $('.callout-button').prop('disabled', false);
            computerReport();
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
        pointsAudio.play();   
        addPoints("red", expt.stat.redRunningScore, expt.stat.redTotalScore);
        addPoints("blue", expt.stat.blueRunningScore, expt.stat.blueTotalScore);
        
        expt.stat.redTotalScore += expt.stat.redRunningScore;
        expt.stat.blueTotalScore += expt.stat.blueRunningScore;
        expt.stat.redRunningScore = 0;
        expt.stat.blueRunningScore = 0;
        if(trial.trialNumber != expt.trials/2){
        	setTimeout(function(){
	            $('#nextKeep').prop('disabled',false);
	        }, 3000);
        }
    } else if(trial.exptPart == "practice"){
        pointsAudio.play();   
        addPoints("red", trial.redTrialScore, 0);
        addPoints("blue", trial.blueTrialScore, 0);
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
    
    if(expt.humanColor == "red"){
        var highlightHuman = colors.teamredblink;
        var highlightComp = colors.teamblueblink;
    } else{
        var highlightHuman = colors.teamblueblink;
        var highlightComp = colors.teamredblink;
    }

    if(trial.exptPart == "practice"){
        $('#turnVid').css('display','none');
        if(trial.roleCurrent == "liar"){
            trial.liarPlayer = expt.compColor;
            trial.roleCurrent = "detector";
            $('#practiceOppDecision').show();
        } else{
            if(trial.callBS){
                $('#practiceOppDecision').html("<center><img src='img/thumbs-up.png' height='200'/><br><p>You caught them!</p></center>");
                var playFunc = function(){
                    var currVideo = document.getElementById('practiceVid');
                    var timer0 = new Timer(function(){
                        blink("leftUpdateBucket", highlightHuman, 40, 2, 0);
                    }, getEventTime('prompt_trick','player_allpoints'));
                    var timer1 = new Timer(function(){
                        blink("rightUpdateBucket", highlightComp, 40, 2, 0);
                    }, getEventTime('prompt_trick','opponent_nopoints'));

                    currVideo.onpause = function(){
                        timer0.pause();
                        timer1.pause();
                    }
                    currVideo.onplay = function(){
                        if(currVideo.currentTime == 0){
                            timer0.reset();
                            timer1.reset();
                        }
                        timer0.resume();
                        timer1.resume();
                    }
                };
                var endFunc = function(){
                    blink("nextKeep", colors.nextblink, 20, 2, 0, true);
                    $('#nextKeep').prop('disabled',false);
                };
                var resetFunc = function(){
                    clearInterval(blinktimer);
                    $('#nextKeep').prop('disabled',true);
                };
                loadVideo("prompt_trick","practiceVid","sideInstruct", playFunc, endFunc, resetFunc);
                
            } else{
                $('#practiceOppDecision').html("<center><img src='img/thumbs-down.png' height='200'/><br><p>They tricked you!</p></center>");
                var playFunc = function(){};
                var endFunc = function(){
                    blink("nextKeep", colors.nextblink, 20, 2, 0, true);
                    $('#nextKeep').prop('disabled',false);
                };
                var resetFunc = function(){
                    clearInterval(blinktimer);
                    $('#nextKeep').prop('disabled',true);
                };
                loadVideo("prompt_truth","practiceVid","sideInstruct", playFunc, endFunc, resetFunc);
            }
            $('#practiceOppDecision').show();

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
                var roletxt = "Decider"
            } else{
                trial.roleCurrent = "liar";
                var roletxt = "Marble-Picker"
            }
            $('#keepDiv').css('opacity',1);
            if(!expt.debug){
                $('#nextKeep').prop('disabled',true);
            }

            $('#turnVid').css('display','block');
            var playFunc = function(){};
            var endFunc = function(){
                blink("nextKeep", colors.nextblink, 20, 2, 0, true);
                $('#nextKeep').prop('disabled',false);
            };
            var resetFunc = function(){
                clearInterval(blinktimer);
                $('#nextKeep').prop('disabled',true);
            };
            loadVideo('switch_'+expt.humanColor+'_'+ trial.roleCurrent,'turnVid',"instruct", playFunc, endFunc, resetFunc);
        }
        $('#humanRole').html(roletxt);
        $('#humanRole').css('color', expt.humanColor);
    }

    if(trial.roleCurrent == "liar"){
        var roletxt = "Marble-Picker"
    } else{
        var roletxt = "Decider"
    }
    
    if(trial.exptPart == "practice"){
        $('.trialNum').html("Practice: <i>" + roletxt + "</i>");
    } else if(trial.trialNumber == expt.trials){
    	$('.trialNum').html("Who won?");
    } else if(trial.trialNumber == (expt.trials/2 + 1)){
        $('.trialNum').html("Round " + (trial.trialNumber+1) + " of " + expt.trials);
    } else{
        $('.trialNum').html("Round " + (trial.trialNumber+1) + " of " + expt.trials + ": <i>" + roletxt + "</i>");
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

function clickWinner(){
    $('#completed').css('display','none');
    $('#confirmation').css('display','block');
    $('#playerprof').css('display','none');
    $('#opponentprof').css('display','none');
}

function confirmEmail(){
    submitContact();
    $('.warning').hide();
    $('.requiredAns').css({"border":"1px inset gray", "background-color":'white'});
    if(checkEmail("email")){
        $('#confirmation').css('display','none');
        $('#debriefing').css('display','block');
        client.demographic = demographicClient;
        data = {client: client, expt: expt, trials: trialData};
        writeServer(data);
    } else{
        $('#email').after('<b class="warning">Please enter a valid email address or "not interested"</b>');
        $('#email').css({"border":"2px solid red", "background-color":colors.warning});
    }
    
}

function experimentDone() {
    $('#debriefing').css('display','none');
    submitExternal(client);
}

