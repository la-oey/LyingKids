function getEventTime(video, event){
    var diffColors =  ["opponent", "screenRecord", "shake_all", "shake_no", "shake_true", "decide_opponentlie"];
    if(diffColors.includes(video)){
        video = video + "_" + expt.humanColor;
    }
    var item = events.find(obj => { return obj.video === (video + ".mp4") && obj.event === event});
    return(item.time);
}

var Timer = function(callback, delay) {
    var timerId, start, remaining = delay;


    this.reset = function() { //if user restarts video to 0, resets timer
        remaining = delay;
    }

    this.pause = function() { //if user pauses video, pauses timer
        window.clearTimeout(timerId);
        remaining -= Date.now() - start;
    };

    this.resume = function() { //if user resumes video, resumes timer
        start = Date.now();
        if(remaining >= 0){
            window.clearTimeout(timerId);
            timerId = window.setTimeout(callback, remaining);
        }
    };

    this.resume();
};

function hasGetUserMedia() {
    return(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
}

function setupCam() {
    Webcam.set({
        width: 320,
        height: 240,
        image_format: 'jpeg',
        jpeg_quality: 90
    })

    Webcam.attach('#thecamera')
}

function showCam(){
    $('#thecamera').css({
        'display':'block',
        'margin-left':'auto',
        'margin-right':'auto'
    })

    $('#clickclick').css({
        'display':'block',
        'margin-left':'auto',
        'margin-right':'auto'
    })
}

function quickCam() {
    setupCam();
    //probably should check for when camera is open, but for now turning on camera for 1 second
    setTimeout(function(){ 
        take_snapshot();
    }, 2000);
}

var playerimage = [];

function take_snapshot() {
    Webcam.snap(function(data_uri){
        Webcam.reset('#thecamera');
        playerimage.push(data_uri);        
        $('#thecamera').html('<img src="'+data_uri+'"/>');
        if(!expt.debug){
            writeImgServer(data_uri);
        }
    })
}

function replacePlayerPic() {
    $('#playericon').attr('src',playerimage[(playerimage.length-1)]);
    $('#playerprof').css('display','block');
}



function loadVideo(vid, to, classtype, callPlayFunc, callEndFunc, callResetFunc){
    $('#'+to+"div").html("<video class='"+classtype+"Vid' id='"+to+"' type='video/mp4' controls autoplay></video>");
    $("#"+to).attr("src","video/"+vid+".mp4");
    $("#"+to+"replay").attr('onclick',"clickReplay(\""+vid+"\",\""+to+"\",\""+classtype+"\","+callPlayFunc+","+callEndFunc+","+callResetFunc+");");
    $('.replayButton').css('display','none');
    if(callPlayFunc != null){
        callPlayFunc();
    }
    document.getElementById(to).onended = function(){
        loadWaiting(vid, to, classtype);
        if(callEndFunc != null){
            callEndFunc();
        }
    }
}

function playVideo(to){ //plays or resumes video
    document.getElementById(to).play();
    $('.replayInstruct').css('display','none');
    // $('#'+to).css('filter','brightness(1)');
}

function pauseVideo(to, time=0){
    if(document.getElementById(to) != null){
        setTimeout(function(){
            document.getElementById(to).pause();
        }, time)
    }
}

function resumeVideo(to){ //plays or resumes video
    document.getElementById(to).play();
    $('#'+to).css('filter','brightness(1)');
}

function loadWaiting(vid, to, classtype){
    let no_replay = ["shake_all_"+expt.humanColor, "shake_q_all_"+expt.humanColor, "shake_no_"+expt.humanColor, "shake_true_"+expt.humanColor, "tricktruth", "prompt_again"];
    //loadVideo("waiting", to);
    //$('#'+to).attr('loop','loop');
    if(no_replay.includes(vid)){
        $('#'+to+"div").html("<video class='"+classtype+"Vid' id='"+to+"' src='video/waiting.mp4' autoplay loop>");
    } else if(to == "screenVid"){
        $("#"+to+"replay").css('display','block');
    }
    else{ //does not load wait gif for screen record
        $('#'+to+"div").html("<video class='"+classtype+"Vid' id='"+to+"' src='video/waiting.mp4' autoplay loop>");
        $("#"+to+"replay").css('display','block');
    }
}

function clickReplay(vid, to, classtype, callPlayFunc, callEndFunc, callResetFunc){
    if(callResetFunc != null){
        callResetFunc();
    } 
    if(vid == "decide_lie"){
        vid = "decide_lie_again";
    }
    loadVideo(vid, to, classtype, callPlayFunc, callEndFunc, callResetFunc);
}

function showPlayer(color){
    $('#playerprof').css('border','5px solid ' + color);
}

function showOpponent(gender, color, teamless=false){
    if(teamless){
        $('#opponentprof').css('border','5px solid black');
    } else{
        $('#opponentprof').css('border','5px solid ' + color);
    }
    $('#opponentprof').css('display','block');
    $('#opponenticon').css('display','block');
    $('#opponenticon').attr('src','img/'+gender+'_'+color+'.jpg');
}



function blink(elem, color, thic, freq, timeStart, interval=false){
    function ablink(){
        setTimeout(function(){
            for(var i=0; i<freq; i++){
                setTimeout(function(){
                    $('#'+elem).css('box-shadow', "0px 0px 30px " + thic.toString() + "px " + color);
                }, 500+(1000*i));
                setTimeout(function(){
                    $('#'+elem).css('box-shadow', '');
                }, 1000+(1000*i));
            }
            
        }, timeStart);
    }
    ablink();
    if(interval){
        blinktimer = setInterval(function(){
            ablink();
        }, 10000);
        $('#'+elem).click(function(){
            clearInterval(blinktimer);
        })
    }
}


function marble(container, color, size, locX, locY){
    d3.select(container).append("circle").attr("cx",locX).attr("cy",locY).attr("r",size).attr("stroke-width",2).attr("stroke","black").style("fill",color);
}

function drape(){
    $('#draw-button').animate({'opacity': 0});
    $('.cover').css('z-index', 1);
    $('.cover').animate({
        "opacity": 1,
        "top": "10%"
    }, 1000, function(){
        $('.urn').css('opacity', 0);
        if(trial.exptPart == "instruct"){
            $('#instructImg1').animate({'opacity':0});
        }
    })

    if(trial.exptPart == "instruct" || trial.exptPart == "practice"){
        trial.drawnRed = 3;
        trial.drawnBlue = 3;
    } else{
        if(expt.pseudo[trial.trialNumber] != -1){
            trial.drawnRed = expt.pseudo[trial.trialNumber];
            trial.drawnBlue = expt.marblesSampled - trial.drawnRed;
            trial.pseudo = true;
        } else{
            for(var i=0; i<expt.marblesSampled; i++){
                if(Math.random() < trial.probabilityRed){
                    trial.drawnRed += 1;
                } else{
                    trial.drawnBlue += 1;
                }
            }
            trial.pseudo = false;
        }
    }
    if(trial.liarPlayer == "red"){
        for(var r=0; r<trial.drawnRed; r++){
            trial.marblesDrawn.push("red");
        }
        for(var b=0; b<trial.drawnBlue; b++){
            trial.marblesDrawn.push("blue");
        }
    } else{
        for(var b=0; b<trial.drawnBlue; b++){
            trial.marblesDrawn.push("blue");
        }
        for(var r=0; r<trial.drawnRed; r++){
            trial.marblesDrawn.push("red");
        }
    }

}


function draw(){
    $('#draw-button').animate({'opacity': 0});
    drape();
    $('#draw-button').attr('onclick','');

    var shakeDelay = 1000;

    setTimeout(function(){
        for(var i=0; i<2; i++){
            $('.cover').animate({
                "top": "9%"
            })
            $('.cover').animate({
                "top": "12%"
            })
        }
    }, shakeDelay);

    
    setTimeout(function(){
        shakeAudio.play();
    }, 300);

    countDraws = 0
    function oneMarble(){
        if(turn.numDrawn < expt.marblesSampled){
            color = trial.marblesDrawn[turn.numDrawn];
            var rollMarble = "<div class='sampMarble' id='marble"+turn.numDrawn+trial.exptPart+"'><svg class='marblesvg' id='marble"+turn.numDrawn+trial.exptPart+"svg'></svg></div>";
            
            if(trial.exptPart == "instruct"){
                var thetube = '#tube0';
                var thetubesvg = "#tubesvg0";
            } else{
                var thetube = '#tube1';
                var thetubesvg = "#tubesvg1";
            }

            $(thetube).append(rollMarble);
            
            marble('#marble'+turn.numDrawn+trial.exptPart+'svg', color, expt.marbleSize, .5*$(thetube).width(), $(thetubesvg).height() - ((turn.numDrawn+1)/(expt.marblesSampled+1))*$(thetubesvg).height());
            $('#marble'+turn.numDrawn+trial.exptPart).animate({'top':'0%'}, 500);
            turn.numDrawn += 1;
            if(turn.numDrawn % 2 == 0){
                setTimeout(function(){
                    dropAudio.play();
                }, 200);
            } else{
                setTimeout(function(){
                    dropAudio2.play();
                }, 200);
            }
            
        }
    }

    function multDraws(){
        var initDrawDelay = 3000;
        var subsDrawDelay = 500;
        var moveTime = 1000;
        var showChoiceTime = 1500;
        if(turn.numDrawn == expt.marblesSampled){
            $('#draw-button').attr('onclick','');
            setTimeout(function(){
                $('.cover').animate({
                    'opacity': 0,
                    'z-index': 0
                }, 1000);
                $('.tube').animate({'top': '15%'}, moveTime);
                if(trial.exptPart == "instruct"){
                    setTimeout(function(){
                        $('#left-move').css('opacity', 1);
                        $('#left-move').attr('onclick','prevInstruct("1");');
                        $('#right-move').css('opacity', 1);
                        $('#right-move').attr('onclick','nextInstruct("1");');
                    }, showChoiceTime)
                } else{
                    setTimeout(function(){
                        showChoices();
                    }, showChoiceTime)
                }
            }, 1000)
        } else{
            var delay = initDrawDelay;
            if(turn.numDrawn > 0){
                delay = subsDrawDelay;
            }
            setTimeout(function(){
                oneMarble();
                multDraws();
            }, delay);
        }
    }
    multDraws();

    
}

function orderTube(type, player, number, marbleSize){
    if(player == "red"){
        var otherplayer = "blue";
    } else{
        var otherplayer = "red"
    }
    if(type=="choice"){
        var indexLab = "#"+type+number;
    } else if(type=="reported"){
        var indexLab = "#tubesvg1"
    } else if(type=="detectRep") {
        var indexLab = "#tubesvg2"
    }
    for(var i=0; i<number; i++){
        //marble(indexLab, player, marbleSize, ((i+1)/(expt.marblesSampled+1))*$(indexLab).width(), .5*$(indexLab).height());
        marble(indexLab, player, marbleSize, .5*$(indexLab).width(), $(indexLab).height() - ((i+1)/(expt.marblesSampled+1))*$(indexLab).height());
    }
    for(var j=0; j<(expt.marblesSampled-number); j++){
        //marble(indexLab, otherplayer, marbleSize, ((number+j+1)/(expt.marblesSampled+1))*$(indexLab).width(), .5*$(indexLab).height());
        marble(indexLab, otherplayer, marbleSize, .5*$(indexLab).width(), $(indexLab).height() - ((number+j+1)/(expt.marblesSampled+1))*$(indexLab).height());
    }
}

var practiceChoiceSeq = [];
var gotAll = false;
var gotNone = false;
var gotTrue = false;
var gotTrick = false;

function practiceHighlightChoice(choice){
    // the gnarliest nested if statement of all time
    practiceChoiceSeq.push(choice);
    yaAudio.pause();
    yaAudio.currentTime = 0;
    noAudio.pause();
    noAudio.currentTime = 0;
    if(!gotAll){
        if(choice == "6"){
            clearInterval(replaytimer);
            yaAudio.play();
            gotAll = true;
            $('.choiceClass').attr('onclick', '');
            $('#practiceVid').attr('onplay','');

            var playFunc = function(){
                var currVideo = document.getElementById('practiceVid');
                var timer0 = new Timer(function(){
                    resetHighlight();
                }, getEventTime('shake_no','question'));

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
            var resetFunc = function(){};
            loadVideo("shake_no_"+expt.humanColor, "practiceVid", "sideInstruct", playFunc, endFunc, resetFunc);

            replaytimer = setInterval(function(){
                loadVideo("shake_no_"+expt.humanColor, "practiceVid", "sideInstruct", playFunc, endFunc, resetFunc);
            }, 20000);            
        } else{
            noAudio.play();
        }
    } else{
        if(!gotNone){
            if(choice == "0"){
                clearInterval(replaytimer);
                yaAudio.play();
                gotNone = true;
                $('.choiceClass').attr('onclick', '');

                var playFunc = function(){
                    var currVideo = document.getElementById('practiceVid');
                    var timer0 = new Timer(function(){
                        resetHighlight();
                    }, getEventTime('shake_true','question'));

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
                var resetFunc = function(){};

                loadVideo("shake_true_"+expt.humanColor, "practiceVid","sideInstruct", playFunc, endFunc, resetFunc);
                replaytimer = setInterval(function(){
                    loadVideo("shake_true_"+expt.humanColor, "practiceVid", "sideInstruct", playFunc, endFunc, resetFunc);
                }, 20000);   
            } else{
                noAudio.play();
            }
        } else{
            if(!gotTrue){
                if(choice == "3"){
                    clearInterval(replaytimer);
                    yaAudio.play();
                    gotTrue = true;
                    $('.choiceClass').attr('onclick', '');

                    var playFunc = function(){
                        var currVideo = document.getElementById('practiceVid');
                        var timer0 = new Timer(function(){
                            blink('choice6img', colors.funcblink, 30, 2, 0);
                            setTimeout(function(){ //might need to get un-highlighted if player restarts video
                                highlightChoice(6);
                            }, 2000);
                        }, getEventTime('decide_lie','lie'));
                        var timer1 = new Timer(function(){
                            gotTrick = true;
                            $('#nextDrawer').prop('disabled',false);
                            blink("nextDrawer", colors.nextblink, 20, 2, 0, true);
                        }, getEventTime('decide_lie','lie_next'));

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
                    var resetFunc = function(){
                        clearInterval(blinktimer);
                        $('#nextDrawer').prop('disabled',true);
                        var currVideo = document.getElementById('practiceVid');
                        var timer0 = new Timer(function(){ //CHECK
                            $('#nextDrawer').prop('disabled',false);
                            blink("nextDrawer", colors.nextblink, 20, 2, 0, true);
                        }, getEventTime('decide_lie_again','lie_next'));
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
                    loadVideo("decide_lie","practiceVid","sideInstruct", playFunc, endFunc, resetFunc);
                } else{
                    noAudio.play();
                }
            }
        }
    }

    if(gotAll & gotNone & gotTrue & gotTrick){
        $('#nextDrawer').prop('disabled', false);
    } else{
        $('#nextDrawer').prop('disabled', true);
    }
}


function highlightChoice(choice){
    if(trial.exptPart != "practice"){
        chooseAudio.pause();
        chooseAudio.currentTime = 0;
        chooseAudio.play();
    }

    //if highlighted, unhighlighted
    if($('#choice'+choice).css('background-color')=='rgb(255, 255, 0)'){
        //$('#choice'+choice).css('background-color','white');
        for(var i=0; i<=expt.marblesSampled; i++){
            $('#choice'+i).on({
                mouseenter: function(){
                    $(this).css('background-color', '#FFFFAD');
                },
                mouseleave: function(){
                    $(this).css('background-color', 'white');
                }
            })
        }
        $('#nextDrawer').prop('disabled', true);
    } else{ //if unhighlighted, highlight
        //unhighlights all
        for(var i=0; i<=expt.marblesSampled; i++){
            if(i != choice){
                $('#choice'+i).css('background-color','white');
                $('#choice'+i).on({
                    mouseenter: function(){
                        $(this).css('background-color', '#FFFFCC');
                    },
                    mouseleave: function(){
                        $(this).css('background-color', 'white');
                    }
                })
            }
        }
        $('#choice'+choice).css('background-color','rgb(255, 255, 0)');
        $('#choice'+choice).off('mouseenter mouseleave');
        $('#nextDrawer').prop('disabled', false);
        trial.highlightedDrawn = choice;
    }

    if(trial.exptPart == "practice"){
        practiceHighlightChoice(choice)
    }
}

function showChoices(){
    $('#choices').css('opacity',1);
    $('#choices').css('z-index',1);

    $('#choices').append("<div id=choiceMid></div>")
    for(var i=0; i<=expt.marblesSampled; i++){
        $('#choiceMid').append("<div class='choiceClass choiceClassMid' id='choice"+i+"'><img id='choice"+i+"img' class='choiceImg' src='img/"+trial.liarPlayer+i+".png' height='200'/></div>");
    }
    $('#nextDrawer').css('opacity',1);
    
    trial.responseStartTime = Date.now();

    if(trial.exptPart == "trial"){
        resetHighlight();
    }
}

function resetHighlight(){
    for(var i=0; i<=expt.marblesSampled; i++){
        $('#choice'+i).attr('onclick','highlightChoice('+i+');');
    }
}

function report(){
    trial.responseTime = Date.now() - trial.responseStartTime;
    trial.reportedDrawn = trial.highlightedDrawn;
    $('#nextDrawer').prop('disabled', true);
    $('#nextDrawer').css('opacity', 0);
    $('#choices').css('opacity',0);
    $('#choices').css('z-index',0);
    $('.tube').css('background-color','white');

    if(trial.liarPlayer == "red"){
        var detectorPlayer = "blue";
    } else{
        var detectorPlayer = "red"
    }
    $('#detectorplayer').html(detectorPlayer);
    $('#detectorplayer').css('color', detectorPlayer);

    if(trial.liarPlayer=="red"){
        trial.reportedRed = trial.reportedDrawn;
        trial.reportedBlue = expt.marblesSampled-trial.reportedDrawn;
    } else{
        trial.reportedBlue = trial.reportedDrawn;
        trial.reportedRed = expt.marblesSampled-trial.reportedDrawn;
    }

    if(trial.exptPart == "instruct"){
        var thetube = '#tube0';
        var thetubesvg = "#tubesvg0";
    } else{
        var thetube = '#tube1';
        var thetubesvg = "#tubesvg1";
    }

    //transforms reported to what other play should see
    for(var i=0; i<expt.marblesSampled; i++){
        if(i < trial.reportedDrawn){
            marble('#marble'+i+trial.exptPart+'svg', trial.liarPlayer, expt.marbleSize, .5*$(thetube).width(), $(thetubesvg).height() - ((i+1)/(expt.marblesSampled+1))*$(thetubesvg).height());
        } else{
            marble('#marble'+i+trial.exptPart+'svg', detectorPlayer, expt.marbleSize, .5*$(thetube).width(), $(thetubesvg).height() - ((i+1)/(expt.marblesSampled+1))*$(thetubesvg).height());
        }
    }

    function liarWait() {
        flickerWait();
        audioWait();
        
        trial.waitTime = 1000 + 1500*exponential(0.75);
        if(trial.exptPart == "practice"){
            $('.replayButton').css('display','none');
            trial.waitTime = 6000;
            setTimeout(function(){
                //INSTRUCT ANIMATIONS
                var playFunc = function(){
                    if(expt.humanColor == "red"){
                        var highlightHuman = colors.teamredblink;
                        var highlightComp = colors.teamblueblink;
                    } else{
                        var highlightComp = colors.teamblueblink;
                        var highlightHuman = colors.teamredblink;
                    }
                    var timer0 = new Timer(function(){
                        blink("rightUpdateBucket", highlightComp, 40, 2, 0);
                    }, getEventTime('decide_switch','opponent_allpoints'));
                    var timer1 = new Timer(function(){
                        blink("leftUpdateBucket", highlightHuman, 40, 2, 0);
                    }, getEventTime('decide_switch','player_nopoints'));
                    var timer2 = new Timer(function(){
                        blink("nextKeep", colors.nextblink, 20, 2, 0, true);
                        $('#nextKeep').prop('disabled',false);
                    }, getEventTime('decide_switch','points_next'));

                    var currVideo = document.getElementById("practiceVid")
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
                var resetFunc = function(){
                    clearInterval(blinktimer);
                    $('#nextKeep').prop('disabled',true);
                };

                loadVideo("decide_switch", "practiceVid","sideInstruct", playFunc, endFunc, resetFunc);
            }, 5500) //EDIT
        }

        setTimeout(function(){
            clearInterval(trial.timer);
            clearInterval(trial.audiotimer);
            
            $('.subjResponse').html("<p><br>They decided!<br><br></p>")
            $('.subjResponse').css('opacity','1');
            if(trial.exptPart == "practice"){
                trial.callBS = true;
            } else{
                computerDetect();
            }
            
            //$('#next').prop('disabled',false);
            setTimeout(function(){
                document.getElementById('trialDrawer').style.display = 'none';
                trialDone();
            }, 2000);
        }, trial.waitTime);
    }
    liarWait();
}

function computerDetect(){
    trial.callBS = false;
    trial.compDetect = cbinom(expt.marblesSampled, trial.probabilityRed, trial.reportedDrawn) * .6 //lowers and flattens diff in prob of calling out by multiplying cbinom by .7
    trial.compLie = -1;
    //console.log("CompDetect: " + trial.compDetect)
    if(Math.random() < trial.compDetect){
        trial.callBS = true;
    }
}

function callout(call){
    chooseAudio.pause();
    chooseAudio.currentTime = 0;
    chooseAudio.play();
    if(trial.exptPart == "practice"){
        clearInterval(replaytimer);
    }
    trial.responseTime = Date.now() - trial.responseStartTime;
    $('.callout-button').prop('disabled', true);
    if(call == 'accept'){
        $('#accept-button').css('opacity','1');
        $('#reject-button').css('opacity','0.5');
        trial.callBS = false;
    } else{
        $('#reject-button').css('opacity','1');
        $('#accept-button').css('opacity','0.5');
        trial.callBS = true;
    }
    $('#nextResponder').prop('disabled',false);
    document.getElementById('trialResponder').style.display = 'none';
    trialDone();
}

function addPoints(player, points, prevPoints){ 
    pointsAudio.play();   
    if(trial.exptPart != "instruct"){
        $('.'+player+"TrialPt").css({'top': '-15%'}, 1000);
        $('.'+player+"TrialPt").animate({'opacity': 1}, 250);
        if(points > 0){
            $('.'+player+"TrialPt").animate({'top': '10%'}, 1000);
        } else if(points < 0){
            $('.'+player+"TrialPt").animate({'top': '-40%'}, 1000);
        }
        var maxPoints = expt.marblesSampled * expt.trials;
        setTimeout(function(){
            $('.'+player+"TrialPt").animate({'opacity': 0}, 250)
            $('#'+player+'UpdateScore').animate({
                'height': (points+prevPoints)/maxPoints*$('.updateBucket').height()
            }, 1000)
            $('.'+player+'Score').css('height', (points+prevPoints)/maxPoints*$('.updateBucket').height());
        }, 1250);

        if(trial.exptPart == "trial"){
            setTimeout(function(){
                $('#nextKeep').prop('disabled',false);
            }, 3000);
        }
    } else{ //instruct
        $('#'+player+"InstrPt").css({'top': '-15%'}, 1000);
        $('#'+player+"InstrPt").animate({'opacity': 1}, 250);
        if(points > 0){
            $('#'+player+"InstrPt").animate({'top': '10%'}, 1000);
        } else if(points < 0){
            $('#'+player+"InstrPt").animate({'top': '-40%'}, 1000);
        }
        var maxPoints = 20;
        setTimeout(function(){
            $('#'+player+"InstrPt").animate({'opacity': 0}, 250)
            $('#'+player+'InstrScore').animate({
                'height': (points+prevPoints)/maxPoints*$('.scoreInstrBucket').height()
            }, 1000)
            $('#'+player+'InstrScore').css('height', (points+prevPoints)/maxPoints*$('.scoreInstrBucket').height());
        }, 1250);

    }
    
}


function keepTurn(){
    document.getElementById('keep').style.display = 'none';
    $('.replayButton').css('display','none');
    clearInterval(blinktimer);
    if(trial.exptPart == "practice"){
        if(trial.roleCurrent == "liar" & trial.trialNumber == 0){
            trial.liarPlayer = expt.humanColor;
            liar();
        } else{
            if(trial.trialNumber == 1){
                $('.redScore').css('height', 0);
                $('.blueScore').css('height', 0);
                trial.liarPlayer = expt.compColor;
                restartTrial();
                detector();
            } else{
                $('.sideInstructVid').hide();
                $('#postPractice').css('display','block');
                $('#continuePost').prop('disabled',true);
                var playFunc = function(){
                    var currVideo = document.getElementById('summaryVid');
                    var timer0 = new Timer(function(){
                        blink('continuePost',  20, 2, 0, true);
                        $('#continuePost').prop('disabled',false);
                    }, getEventTime('summary','next'));

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
                    clearInterval(blinktimer);
                    $('#continuePost').prop('disabled',true);
                };
                loadVideo("summary","summaryVid","instruct", playFunc, endFunc, resetFunc);
            }
        }
    }
    else{
        if(trial.roleCurrent == "liar"){
            liar();
        } else{
            restartTrial();
            detector();
        }
    }
}

function restartTrial(){
    $('.urn').css('opacity', 1);
    $('.tube').css('opacity', 1);
    $('#tube1').css('background-color','gray');
    //$('.urnsvg').empty();
    $('.tubesvg').empty();
    $('.marblesvg').empty();
    $('.sampMarble').css('top', '-80%');
    $('.subjResponse').css('opacity','0');
    
    trial.probabilityRed = expt.trialProbs; //can set this to a number that changes across trials
    trial.probabilityBlue = 1-trial.probabilityRed;
    trial.drawnRed = 0;
    trial.drawnBlue = 0;
    
    //fillUrn(250,trial.probabilityRed);
    //marble(".urnbottom", "black", expt.marbleSize*1.2, 0.5*$('.urnbottom').width(), 0.5*$('.urnbottom').height());

    trial.catch.key = -1;
    trial.catch.response = -1;
    trial.catch.responseTime = -1;
    $('#catchQ').hide();

    trial.startTime = Date.now();
}

function flickerWait(){
    var op = 0.1;
    var increment = 0.1;
    $('.subjResponse').html('<p><br>Waiting...<br><br></p>');
    $('.subjResponse').css('opacity','0');
    trial.timer = setInterval(go, 50)
    function go(){
        op += increment;
        $('.subjResponse').css('opacity', op);
        if(op >= 1){
            increment = -increment;
        }
        if(op <= 0){
            increment = -increment;
        }
    }
}

function audioWait(){
    if(trial.exptPart == "trial"){
        waitAudio.currentTime = 0;
        waitAudio.play();
        trial.audiotimer = setInterval(function(){
            waitAudio.play();
        }, 4000);
    }
}


function computerReport(){

    //groundTruth
    for(var i=0; i<expt.marblesSampled; i++){
        if(Math.random() < trial.probabilityRed){
            trial.drawnRed += 1;
        } else{
            trial.drawnBlue += 1;
        }
    }
    debugLog("drawn red: " + trial.drawnRed + "; drawn blue: " + trial.drawnBlue);
    if(trial.exptPart == "practice"){
        //INSTRUCT ANIMATIONS
        $("#tubesvg1").css('opacity',1);
        trial.reportedDrawn = 6;
        trial.drawnRed = 3; //reported is a lie
        trial.drawnBlue = 3;
        $('.callout-button').prop('disabled',true);

        var playFunc = function(){
            var timer0 = new Timer(function(){
                blink("tube2", colors.funcblink, 20, 2, 0);
            }, getEventTime('decide_opponentlie', 'opponent_lie'));

            var currVideo = document.getElementById("practiceVid")
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
            $('#practiceVid').attr('onplay','');
            var playFunc = function(){
                var timer0 = new Timer(function(){
                    blink('reject-button', colors.trickblink, 20, 2, 0);
                }, getEventTime('tricktruth', 'orange_button'));
                var timer1 = new Timer(function(){
                    blink('accept-button', colors.truthblink, 20, 2, 0);
                }, getEventTime('tricktruth', 'green_button'));

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
            var endFunc = function(){
                $('#practiceVid').attr('onplay','');
                $('.callout-button').prop('disabled',false);

                replaytimer = setInterval(function(){
                    var playFunc = function(){
                        var timer0 = new Timer(function(){
                            blink('reject-button', colors.trickblink, 20, 2, 0);
                        }, getEventTime('prompt_again', 'orange_button'));
                        var timer1 = new Timer(function(){
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
            };
            var resetFunc = function(){};
            loadVideo('tricktruth','practiceVid',"sideInstruct", playFunc, endFunc, resetFunc);
        };
        var resetFunc = function(){};
        
        loadVideo("decide_opponentlie_"+expt.humanColor, "practiceVid","sideInstruct", playFunc, endFunc, resetFunc);

    } else if(expt.pseudo[trial.trialNumber] != -1){
        trial.reportedDrawn = expt.pseudo[trial.trialNumber];
        trial.pseudo = true;
    } else{
        trial.pseudo = false;
        if(Math.random() < 0.2){
            trial.compUnifLie = true;
            trial.reportedDrawn = Math.floor(randomDouble(0,expt.marblesSampled+1));
        } else{
            var rand = Math.random();
            var lie = getK(expt.marblesSampled, trial.probabilityRed, rand);
            if(expt.humanColor == 'blue'){
                if(lie <= trial.drawnRed){
                    trial.reportedDrawn = trial.drawnRed;
                } else{
                    trial.reportedDrawn = lie;
                }
            } else{
                lie = expt.marblesSampled - lie;
                if(lie <= trial.drawnBlue){
                    trial.reportedDrawn = trial.drawnBlue;
                } else{
                    trial.reportedDrawn = lie;
                }
            }
            trial.compLie = lie;
            trial.compDetect = -1;
            debugLog("Opponent's Internal Gen Lie: " + trial.compLie)
        }
    }
    if(expt.humanColor == 'red'){
        trial.reportedBlue = trial.reportedDrawn;
        trial.reportedRed = expt.marblesSampled - trial.reportedDrawn;
    } else{
        trial.reportedRed = trial.reportedDrawn;
        trial.reportedBlue = expt.marblesSampled - trial.reportedDrawn;
    }

    debugLog("Opponent's report: " + trial.reportedDrawn);

}

function toWinnerCircle(){
    document.getElementById('keep').style.display = 'none';
    let winnerPlayer = null;
    if(expt.stat.redTotalScore == expt.stat.blueTotalScore){
        $('#whowon').html("You tied!");
    } else if(expt.stat.redTotalScore > expt.stat.blueTotalScore){
        $('#whowon').html("<b style='color:red'>Red won the game!</b>");
        if(expt.humanColor == "red"){
            winnerPlayer = "player";
        } else{
            winnerPlayer = "opponent";
        }
    } else{
        $('#whowon').html("<b style='color:blue'>Blue won the game!</b>");
        if(expt.humanColor == "blue"){
            winnerPlayer = "player";
        } else{
            winnerPlayer = "opponent";
        }
    }

    //$('.scoreboardDiv').show();

    $('.redFinalScore').html(expt.stat.redTotalScore);
    $('.blueFinalScore').html(expt.stat.blueTotalScore);

    // expt done
    data = {client: client, expt: expt, trials: trialData};
    //writeServer(data);
    writeServer(data);

    document.getElementById('completed').style.display = 'block';
    winnerAudio.play();

    $('#continueWinner').prop('disabled', true);
    $('#winnerVid').css('display','none');

    setTimeout(function(){
        $('#winnerVid').css('display','block');
        var playFunc = function(){};
        var endFunc = function(){
            blink("nextWinner", colors.nextblink, 20, 2, 0, true);
            $('#continueWinner').prop('disabled',false);
        };
        var resetFunc = function(){
            clearInterval(blinktimer);
            $('#continueWinner').prop('disabled',true);
        };
        loadVideo('winner_'+winnerPlayer,'winnerVid',"instruct", playFunc, endFunc, resetFunc);
    }, 2000);
    
}





// helper functions
function sample(set) {
    return (set[Math.floor(Math.random() * set.length)]);
}

function randomDouble(min, max){
    return Math.random() * (max - min) + min;
}

function shuffle(set){
    var j, x, i;
    for (i = set.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = set[i];
        set[i] = set[j];
        set[j] = x;
    }
    return set;
}

function recordData(){
    trialData.push({
        playerColor: expt.humanColor,
        compColor: expt.compColor,
        exptPart: trial.exptPart,
        trialNumber: trial.trialNumber,
        playerRole: trial.roleCurrent,
        liarPlayer: trial.liarPlayer,
        marblesSampled: expt.marblesSampled,
        probabilityRed: trial.probabilityRed,
        drawnRed: trial.drawnRed,
        drawnBlue: trial.drawnBlue,
        reportedDrawn: trial.reportedDrawn,
        reportedRed: trial.reportedRed,
        reportedBlue: trial.reportedBlue,
        callBS: trial.callBS,
        redTrialScore: trial.redTrialScore,
        blueTrialScore: trial.blueTrialScore,
        redTotalScore: expt.stat.redTotalScore,
        blueTotalScore: expt.stat.blueTotalScore,
        responseTime: trial.responseTime,
        trialTime: trial.trialTime,
        currStartTime: trial.startTime,
        currEndTime: trial.currEndTime
    })
}

function debugLog(message) {
    if(expt.debug){
        console.log(message);
    }
}

function binom(n, p, k){
    return (factorial(n)/(factorial(k)*factorial(n-k))) * p ** k * (1-p) ** (n-k);
}

function factorial(x){
    if(x == 0){
        return 1;
    } else{
        return x*factorial(x-1);
    }
}

function cbinom(n, p, k){
    if(k == 0){
        return binom(n, p, 0);
    } else{
        return binom(n, p, k) + cbinom(n, p, k-1);
    }
}

function getK(n, p, r){
    var i = 0;
    while(r > cbinom(n, p, i)){
        i += 1;
    }
    return i;
}

function exponential(lambda){
    return lambda * Math.E ** (-lambda*Math.random())
}

function calculateStats(string, numer, denom){
    if(denom == 0){
        $(string).html("N/A");
    } else{
        $(string).html(Math.round(numer * 100 / denom)+"%");
    }
}

function scorePrefix(score){
    if(score <= 0){
        return(score);
    } else{
        return("+" + score);
    }
}

function distributeChecks(totalTrials, freq){
    var round = Math.floor(totalTrials * freq);
    var checkRounds = [];
    for(var i=0; i<totalTrials/round; i++){
        checkRounds.push(round*i + Math.floor(randomDouble(0,round)));
    }
    return(checkRounds);
}

function distributePseudo(totalTrials){
    var pseudoDict = {};
    var arrPseudo = [0,1,5,6];
    var bucketLie = arrPseudo.slice(0);

    for(var i=0; i<totalTrials/2 - arrPseudo.length; i++){
        bucketLie.push(-1);
    }
    var bucketDetect = bucketLie.slice(0);

    bucketLie = shuffle(bucketLie);
    bucketDetect = shuffle(bucketDetect);

    if(expt.roleFirst == "liar"){
        var pseudoDict = bucketLie.concat(bucketDetect);
    } else{
        var pseudoDict = bucketDetect.concat(bucketLie);
    }
    debugLog(pseudoDict);

    return(pseudoDict);
}








// function wait(delayInMS) {
//   return new Promise(resolve => setTimeout(resolve, delayInMS));
// }

// function startRecording(stream, lengthInMS) {
//     let recorder = new MediaRecorder(stream);
//     let vid_data=[];

//     recorder.ondataavailable = event => vid_data.push(event.data);

//     recorder.start();
//     //console.log(recorder.state + " for " + (lengthInMS/1000) + " seconds...");

//     let stopped = new Promise((resolve, reject) => {
//         recorder.onstop = resolve;
//         recorder.onerror = event => reject(event.name);
//     });

//     let recorded = wait(lengthInMS).then(() => {
//         recorder.state == "recording" && recorder.stop();
//     });
  
//     return(Promise.all([
//         stopped,
//         recorded
//     ]).
//     then(() => vid_data));
// }

// function turnOnVideoCamera(){
//     if(!hasGetUserMedia()){
//         alert('getUserMedia() is not supported by your browser.')
//     } else{
//         $('#opponenticon').css('display','block');
//         $('.videostream').css('display','block');
//         const recordingTimeMS = 10000; //max recording is 20 mins
//         var constraints = {video:true, audio:true};
//         var preview = document.querySelector('.videostream');
//         navigator.mediaDevices.getUserMedia(constraints)
//         .then(stream => {
//             preview.srcObject = stream;
//             preview.captureStream = preview.captureStream || preview.mozCaptureStream;
//             return new Promise(resolve => preview.onplaying = resolve);
//         })
//         .then(() => startRecording(preview.captureStream(), recordingTimeMS))
//         .then(recordedChunks => {
//             var recordedBlob = new Blob(recordedChunks, {type: "video/webm"});
//             vidData = URL.createObjectURL(recordedBlob);
            
//             //saves video file as form data
//             if(!expt.debug){
//                 var formdata = new FormData();
//                 formdata.append('name', client.sid);
//                 formdata.append('file', recordedBlob);
//                 writeVidServer(formdata);
//             }
//         });
//     }
// }

// function turnOffVideoCamera(stream){
//     var preview = document.querySelector('.videostream');
//     preview.srcObject.getTracks().forEach(track => track.stop());
// }