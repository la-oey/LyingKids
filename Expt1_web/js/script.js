

function pageLoad() {
    var startPage = "presetup";
    // client.type = "sona";
    setupFunctions();

    var beforeParamInputs = ["presetup","setup","consent","demographic","start","photobooth","introduction","pickColor"];
    if(!beforeParamInputs.includes(startPage)){
        expt.human.color = "blue";
        expt.comp.color = "red";
        colors.teamplayerblink = colors.teamblueblink;
        colors.teamopponentblink = colors.teamredblink;
        $('#leftUpdateBucket').html("<img class='imgPt bluePt blueTrialPt' src='img/bluepoint.png' width='100%'><div class='playerScore blueScore' id='blueUpdateScore'></div>");
        $('#rightUpdateBucket').html("<img class='imgPt redPt redTrialPt' src='img/redpoint.png' width='100%'><div class='playerScore redScore' id='redUpdateScore'></div>");
        $('#leftUpdateBucketliar').html("<img class='imgPt bluePt blueTrialPt' src='img/bluepoint.png' width='100%'><div class='playerScore blueScore' id='blueUpdateScoreliar'></div>");
        $('#rightUpdateBucketliar').html("<img class='imgPt redPt redTrialPt' src='img/redpoint.png' width='100%'><div class='playerScore redScore' id='redUpdateScoreliar'></div>");
        $('#leftUpdateBucketdetector').html("<img class='imgPt bluePt blueTrialPt' src='img/bluepoint.png' width='100%'><div class='playerScore blueScore' id='blueUpdateScoredetector'></div>");
        $('#rightUpdateBucketdetector').html("<img class='imgPt redPt redTrialPt' src='img/redpoint.png' width='100%'><div class='playerScore redScore' id='redUpdateScoredetector'></div>");
        $('.scoreboardDiv').html("<div class='scoreCol' style='color:blue'>Blue Score:<br><b class='blueFinalScore'>0</b></div><div class='scoreCol' style='color:red'>Red Score:<br><b class='redFinalScore'>0</b></div>");
    }

    $("#consentForm").load("madlab/consent_"+client.type+".html"); 
    $("#demoSurvey").load("madlab/demographic_"+client.type+".html");
    if(client.type == "sona"){
    	$('#presetupTxt').html("For now, you'll be doing set up!");
    	$('#startTxt').html("This study is designed for children, but we need your help to see how adults behave playing the same game.<br><br>Let's begin!");
    	$('#contactinfo').hide();
    	$('#commentsTxt').html("Please tell us if you have any comments! If you experienced any issues during the task, let us know here.")
    } 
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
    $('#consent').css('display','block');
    checkWindowDimensionsDynamic(params.minWindowWidth, params.minWindowHeight, false);
}

function clickConsent() {
    let minAge = params.minAge;
    let maxAge = params.maxAge;
    submitConsent();
    $('.warning').hide();
    $('.requiredAns').css({"border":"1px inset gray", "background-color":'white'});
    var canContinue = client.type == "sona" ? checkCheckbox("checkconsent") : checkCheckbox("checkconsent") & checkDOB("DOB", minAge, maxAge)
    
    if(canContinue){
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
        if(client.type == "visitor"){
        	if(!checkText("DOB","")){
	            $('#DOB').after("<b class='warning'> Please enter a valid date</b>");
	            $('#DOB').css({"border":"2px solid red", "background-color":colors.warning});
	        } else if(!checkDOB("DOB", minAge, maxAge)){
	            $('#DOB').after("<b class='warning'> Child participants must be between the ages of " + minAge + " and " + maxAge + "</b>");
	            $('#DOB').css({"border":"2px solid red", "background-color":colors.warning});
	        }
        }
        
    }
}

function clickDemo() {
    submitDemo();
    $('.warning').hide();
    $('.requiredAns').css({"border":"1px inset gray", "background-color":'white'});
    var canContinue = client.type == "sona" ? checkRadio("stillimages") : demographicClient.imageAllowed == "yes";
    //console.log(demographicClient.imageAllowed)
    if(canContinue){
        $('#demographic').css('display','none');
        $('#start').css('display','block');
        window.scrollTo(0, 0);
        blink("letsgo", colors.nextblink, 20, 2, 3000, true);

        //saves client data from 2nd page of consent
        client.demographic = demographicClient;
        data = {client: client, expt: expt, trials: trialData};
        writeServer(data);
    } else{
    	if(client.type == "visitor"){
	    	$('#imagetapingLabel').after("<b class='warning' style='font-size:10px'> This task requires still images to confirm that a child is participating. Select 'yes' to continue.</b>");
	    } else{
	        $('#imagetapingLabel').after("<b class='warning'> Please select one</b>");
	    }
    } 
}

function clickStart() {
    $('#start').css('display','none');
    $('#clickclick').prop('disabled',true);
    trial.startTime = Date.now();

    if(demographicClient.imageAllowed == "yes"){
        $('#photobooth').css('display','block');
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
    // Webcam.reset('#thecamera');
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
    quickCam();
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
    };

    var resetFunc = function(){
        $('.color-button').prop('disabled',true);
    };

    loadVideo("color","colorVid","instruct", playFunc, endFunc, resetFunc);
}

function pickCol(color){
    if(color == 'red'){
        $('#red-button').css('opacity','1');
        $('#blue-button').css('opacity','0.4');
        expt.human.color = "red";
        expt.comp.color = "blue";
    } else{
        $('#blue-button').css('opacity','1');
        $('#red-button').css('opacity','0.4');
        expt.human.color = "blue";
        expt.comp.color = "red";
    }

    // INSTRUCT ANIMATIONS
    if(!expt.debug){
        $('.color-button').prop('disabled',true);
    }
    
    if(expt.human.color == 'red'){
        colors.teamplayerblink = colors.teamredblink;
        colors.teamopponentblink = colors.teamblueblink;
    } else{
        colors.teamplayerblink = colors.teamblueblink;
        colors.teamopponentblink = colors.teamredblink;
        $('#leftUpdateBucket').html("<img class='imgPt bluePt blueTrialPt' src='img/bluepoint.png' width='100%'><div class='playerScore blueScore' id='blueUpdateScore'></div>");
        $('#rightUpdateBucket').html("<img class='imgPt redPt redTrialPt' src='img/redpoint.png' width='100%'><div class='playerScore redScore' id='redUpdateScore'></div>");
        $('#leftUpdateBucketliar').html("<img class='imgPt bluePt blueTrialPt' src='img/bluepoint.png' width='100%'><div class='playerScore blueScore' id='blueUpdateScoreliar'></div>");
        $('#rightUpdateBucketliar').html("<img class='imgPt redPt redTrialPt' src='img/redpoint.png' width='100%'><div class='playerScore redScore' id='redUpdateScoreliar'></div>");
        $('#leftUpdateBucketdetector').html("<img class='imgPt bluePt blueTrialPt' src='img/bluepoint.png' width='100%'><div class='playerScore blueScore' id='blueUpdateScoredetector'></div>");
        $('#rightUpdateBucketdetector').html("<img class='imgPt redPt redTrialPt' src='img/redpoint.png' width='100%'><div class='playerScore redScore' id='redUpdateScoredetector'></div>");
        $('.scoreboardDiv').html("<div class='scoreCol' style='color:blue'>Blue Score:<br><b class='blueFinalScore'>0</b></div><div class='scoreCol' style='color:red'>Red Score:<br><b class='redFinalScore'>0</b></div>")
    }
    if(['male','female'].includes(demographicClient.gender)){
        expt.comp.gender = demographicClient.gender;
    } else{
        expt.comp.gender = sample(['male','female']);
    }

    sayAudio.Report = new Audio("audio/say_"+expt.human.color+"_and_"+expt.comp.color+"_marbles.wav");
    sayAudio.Attention = new Audio("audio/say_attention_"+expt.human.color+".wav");

      /////////////////
     /// animation ///
    /////////////////
    
    var playFunc = function(){
        var currVideo = document.getElementById('colorVid');
        var timer0 = new Timer(function(){
            showPlayer(expt.human.color);
            blink('playerprof', colors.teamplayerblink, 20, 2, 0);
        }, getEventTime("opponent", 'player_team'));
        
        var timer1 = new Timer(function(){
            showOpponent(expt.comp.gender,expt.comp.color,true);
        }, getEventTime("opponent", 'other_player'));
        var timer2 = new Timer(function(){
            showOpponent(expt.comp.gender,expt.comp.color);
            blink('opponentprof', colors.teamopponentblink, 20, 2, 0);
        }, getEventTime("opponent", 'opponent_team'));
        var timer3 = new Timer(function(){
            $('#continueColor').prop('disabled',false);
            blink('continueColor', colors.nextblink, 20, 2, 0, true);
        }, getEventTime("opponent", 'opponent_button'));

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

    loadVideo("opponent_"+expt.human.color,"colorVid","instruct", playFunc, endFunc, resetFunc);    
}



function clickColor() {
    pauseVideo("colorVid");
    $('#pickColor').css('display','none');
    $('.tube').show();
    $('.tubesvg').empty();
    $('.marblesvg').empty();
    $('.sampMarble').css('top', '-80%');
    trial.exptPart = "practice";

    //document.getElementById('keep').style.display = 'block';
    keepTurn();
    trial.liarPlayer = expt.human.color;
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

    loadVideo("shake_shakebutton","practiceVid","sideInstruct", playFunc, endFunc, resetFunc);
}

function clickPostPractice(){
    $('#postPractice').css('display','none');
    $('#keep').css('display','block');
    
    $('.sideInstructVid').css('display','none');


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
        var roletxt = "Marble-Picker"
    } else{
        var roletxt = "Decider"
    }
    $('#turnVid').css('display','block');
    var playFunc = function(){};
    var endFunc = function(){
        setTimeout(function(){
            keepTurn();
        }, 1000);
    };
    var resetFunc = function(){};
    loadVideo('start_'+expt.human.color+'_'+ trial.roleCurrent,'turnVid',"instruct", playFunc, endFunc, resetFunc);

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
    if(trial.exptPart == "trial"){
        sayAudio.ShakeTheBox.currentTime = 0;
        sayAudio.ShakeTheBox.play();
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

            $('.subjResponse').css('opacity','0');
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

    if(trial.exptPart == "practice"){
        $('.callout-button').prop('disabled', true);
        var timer0, timer1, timer2;
        var setDecideOppLie = function(){
            var resetFunc = function(){};
            var playFunc = function(){
                timer0 = new Timer(function(){
                    blink("tube2", colors.funcblink, 20, 2, 0);
                }, getEventTime('decide_opponentlie', 'opponent_lie'));
                timer1 = new Timer(function(){
                    blink('reject-button', colors.trickblink, 20, 2, 0);
                }, getEventTime('decide_opponentlie', 'orange_button'));
                timer2 = new Timer(function(){
                    blink('accept-button', colors.truthblink, 20, 2, 0);
                    $('.callout-button').prop('disabled', false);
                }, getEventTime('decide_opponentlie', 'green_button'));

                var currVideo = document.getElementById("practiceVid")
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
                $('#practiceVid').attr('onplay','');
                $('.callout-button').prop('disabled',false);

                if(!client.tablet){
                    replaytimer = setInterval(function(){
                        var playFunc = function(){
                            timer0 = new Timer(function(){
                                blink('reject-button', colors.trickblink, 20, 2, 0);
                            }, getEventTime('prompt_again', 'orange_button'));
                            timer1 = new Timer(function(){
                                blink('accept-button', colors.truthblink, 20, 2, 0);
                            }, getEventTime('prompt_again', 'green_button'));
                            var currVideo = document.getElementById('practiceVid');
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
                        var endFunc = function(){};
                        var resetFunc = function(){};
                        loadVideo('prompt_again', 'practiceVid',"sideInstruct", playFunc, endFunc, resetFunc);
                    }, 20000);
                }
            };
            loadVideo("decide_opponentlie_"+expt.human.color, "practiceVid","sideInstruct", playFunc, endFunc, resetFunc);
        }

        if(client.tablet){
            setDecideOppLie();
            pauseVideo("practiceVid");
            timer0.pause();
            timer1.pause();
            timer2.pause();
            setTimeout(function(){
                playVideo("practiceVid");
            }, trial.waitTime);
        } else{
            setTimeout(function(){
                setDecideOppLie();
            }, trial.waitTime)
        }
    }
}



function trialDone() {
    quickCam();

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

        console.log("marble-picker told truth: " + (trial.reportedRed == trial.drawnRed));
        console.log("responder accused trick: " + trial.callBS);
        console.log("red: " + trial.redTrialScore + " | blue: " + trial.blueTrialScore); //EDIT later
        console.log("red cumulative score: " + (expt.stat.redRunningScore + expt.stat.redTotalScore));
        console.log("blue cumulative score: " + (expt.stat.blueRunningScore + expt.stat.blueTotalScore));
    } else{
        trial.redTrialScore = 0;
        trial.blueTrialScore = 0;
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

    if(trial.exptPart == "practice"){
        pointsAudio.play();  
        addPoints("red", trial.redTrialScore, 0, trial.roleCurrent);
        addPoints("blue", trial.blueTrialScore, 0, trial.roleCurrent);

        $('#turnVid').css('display','none');
        if(trial.roleCurrent == "liar"){
            trial.liarPlayer = expt.comp.color;
            trial.roleCurrent = "detector";
        } else{
            if(trial.callBS){   
                var playFunc = function(){
                    var currVideo = document.getElementById('practiceVid');
                    var timer0 = new Timer(function(){
                        blink("leftUpdateBucketdetector", highlightHuman, 40, 2, 0);
                    }, getEventTime('prompt_trick','player_allpoints'));
                    var timer1 = new Timer(function(){
                        blink("rightUpdateBucketdetector", highlightComp, 40, 2, 0);
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
                    setTimeout(function(){
                        $('#trialResponder').css('display','none');
                        keepTurn();
                    }, 1000);
                };
                var resetFunc = function(){};
                loadVideo("prompt_trick","practiceVid","sideInstruct", playFunc, endFunc, resetFunc);
                
            } else{
                var playFunc = function(){
                    var currVideo = document.getElementById('practiceVid');
                    var timer0 = new Timer(function(){
                        blink("rightUpdateBucketdetector", highlightComp, 40, 2, 0);
                    }, getEventTime('prompt_truth','opponent_allpoints'));
                    var timer1 = new Timer(function(){
                        blink("leftUpdateBucketdetector", highlightHuman, 40, 2, 0);
                    }, getEventTime('prompt_truth','player_nopoints'));

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
                    setTimeout(function(){
                        $('#trialResponder').css('display','none');
                        keepTurn();
                    }, 1000);
                };
                var resetFunc = function(){};
                loadVideo("prompt_truth_"+expt.human.color,"practiceVid","sideInstruct", playFunc, endFunc, resetFunc);
            }
        }
    } else { // "trial"
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
           debugLog('saved'); 
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
    if(client.type == "sona" || checkEmail("email")){
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
        $('#presetupButtonDiv').html('<a href="https://madlab.ucsd.edu/experiments/trick-or-truth-2/"><button class="big-button active-button" id="continuePreSetup">Return to study info</button></a>');
    } else if((client.userAgent.includes("iPad") || (client.userAgent.includes("Macintosh") & client.screen.width <= 1024)) & client.userAgent.includes("CriOS")){
        $('#presetupTxt').html('<b>Uh oh!</b> We noticed that you seem to be using Google Chrome on an iPad. To continue with the task, we ask that you please switch your browser to Safari. Thank you.');
        $('#presetupTxt').append('<br><br>Experiencing problems? Email us at <a href="mailto:MaDlab@ucsd.edu">MaDlab@ucsd.edu</a>.');
        $('#presetupButtonDiv').html('<a href="https://madlab.ucsd.edu/experiments/trick-or-truth-2/"><button class="big-button active-button" id="continuePreSetup">Return to study info</button></a>');
    } else if(client.tablet){
        $('#presetupTxt').append('<br><br>Please keep your tablet in landscape mode. Thanks!<br><br><img src="img/rotateIpad.gif">');
        checkOrientation();
    }
}