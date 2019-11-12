// https://ucsd.sona-systems.com/webstudy_credit.aspx?experiment_id=1465&credit_token=c6393dd431374ab48035c7fafafced2e&survey_code=XXXX
// experiment settings
var expt = {
    saveURL: 'submit.simple.php',
    trials: 20, //switched from 100
    practiceTrials: 1, //how many practice trials //switch to 4
    marblesSampled: 6, //total number of marbles drawn per trial
    numPerDrawn: 2,
    marbleSize: 20,
    roles: ['liar', 'detector'],
    allTrialProbs: [0.5],//[0.2,0.5,0.8],
    trialProbs: 0,
    choiceArr: "oneRow",
    catchTrials: [],
    stat: {
        redTotalScore: 0,
        blueTotalScore: 0
        // truth: 0,
        // truth_noBS: 0,
        // truth_BS: 0,
        // lie: 0,
        // lie_noBS: 0,
        // lie_BS: 0,
        // noBS: 0,
        // noBS_truth: 0,
        // noBS_lie: 0,
        // BS: 0,
        // BS_truth: 0,
        // BS_lie: 0
    },
    sona: {
        experiment_id: 1505,
        credit_token: 'b20092f9d3b34a378ee654bcc50710ea'
    }
};
var trial = {
    exptPart: 'practice', //parts: {'practice','trial'}
    roleCurrent: 'liar',
    liarPlayer: 'red', // {red, blue} ~ player1 vs player2
    trialNumber: 0,
    startTime: 0,
    trialTime: 0,
    responseStartTime: 0,
    responseTime: 0,
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



// TODO, Potentially: pick randomly between human/threePoints instructions.
function pageLoad() {
    //document.getElementById('instructions').style.display = 'block'; //CHANGE BACK
    expt.trialProbs = sample(expt.allTrialProbs);
    $('.trialNum').html("Practice");
    $('#liarplayer').html(trial.liarPlayer);
    $('#liarplayer').css('color', trial.liarPlayer);
    document.getElementById('keep').style.display = 'block';
}

function clickInstructions() {
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('prePractice').style.display = 'block';
}

function clickPrePractice(){
    document.getElementById('prePractice').style.display = 'none';
    expt.catchTrials = distributeChecks(expt.practiceTrials, 0.50); // 0.5 of practice trials have an attention check
    liar();
}

function clickPostPractice(){
    document.getElementById('postPractice').style.display = 'none';

    expt.catchTrials = distributeChecks(100, 0.10); // 0.1 of expt trials have an attention check
    expt.roleFirst = sample(expt.roles);
    trial.roleCurrent = expt.roleFirst;
    liar();
}

function fillUrn(totalMarbles, probability) {
    var exactRed = Math.round(totalMarbles * probability);
    var exactBlue = totalMarbles - exactRed;

    for(var i=0; i<totalMarbles; i++){
        var color = "blue";

        // balls in urn correspond to exact probability distribution, i.e. no random sampling
        if(Math.random() < (exactRed/(exactRed + exactBlue))){
            color = "red"
            trial.urnRed += 1;
            exactRed -= 1;
        } else{
            trial.urnBlue += 1;
            exactBlue -= 1;
        }

        marble(".urnsvg", color, expt.marbleSize-5, randomDouble(.07*$('.suburn').width(), .93*$('.suburn').width()), randomDouble(.07*$('.suburn').height(), .93*$('.suburn').height()));
    }

    $('#draw-button').animate({'opacity': 1});
}

function marble(container, color, size, locX, locY){
    d3.select(container).append("circle").attr("cx",locX).attr("cy",locY).attr("r",size).attr("stroke-width",2).attr("stroke","black").style("fill",color);
}


function drape(){
    $('#draw-button').animate({'opacity': 0});
    $('#cover').animate({
        "opacity": 1,
        "top": "14%"
    }, 1000, function(){
        $('.urn').css('opacity', 0);
        $('#draw-button').animate({'opacity': 1});
        $('#draw-button').html('Draw<br>Marbles');
        document.getElementById('draw-button').setAttribute('onclick','draw();');
    })

    if(trial.exptPart == "practice"){
        turn.practiceOrder = shuffle(["red", "red", "red", "red", "blue", "blue"]);
        trial.drawnRed = 4;
        trial.drawnBlue = 2;
    }
}


function draw(){
    $('#draw-button').animate({'opacity': 0});
    document.getElementById('draw-button').setAttribute('onclick','');
    for(var i=0; i<2; i++){
        $('#cover').animate({
            "top": "9%"
        })
        $('#cover').animate({
            "top": "14%"
        })
    }
    var audio = new Audio('audio/shake.wav');
    audio.play(); 

    countDraws = 0
    function oneMarble(){
        if(turn.numDrawn < expt.marblesSampled){
            var color = "blue";
            if(trial.exptPart == "practice"){
                color = turn.practiceOrder[turn.numDrawn];
            } else{
                if(Math.random() < trial.probabilityRed){
                    color = "red";
                    trial.drawnRed += 1;
                } else{
                    trial.drawnBlue += 1;
                }
            }
            
            marble(".tubesvg", color, expt.marbleSize, ((turn.numDrawn+1)/(expt.marblesSampled+1))*$('.tubesvg').width(), .5*$('.tube').height())
            trial.marblesDrawn.push(color);
            turn.numDrawn += 1;
        }
    }

    function multDraws(){
        if(turn.numDrawn == expt.marblesSampled){
            document.getElementById('draw-button').setAttribute('onclick','');
            $('#draw-button').css('opacity','0');
            reorderAnimation();
        } else if(countDraws == expt.numPerDrawn){
            $('#draw-button').animate({'opacity': 1});
            document.getElementById('draw-button').setAttribute('onclick','draw();');
        } else{
            var delay = 500;
            if(countDraws == 0){
                delay = 2000;
            }
            setTimeout(function(){
                oneMarble();
                countDraws += 1;
                multDraws();
            }, delay);
        }
    }
    multDraws();
}

function reorderAnimation(){
    //duration of animations
    var fadeTime = 2000;
    var pauseTime1 = 2000;
    var moveTime = 1000;
    var durRotate = 1000;
    var rotations = 5;
    var totalRotate = durRotate * (rotations+1);
    var pauseTime2 = 1000;
    $('#cover').animate({'opacity': 0}, fadeTime);
    $('#occluder').animate({
        'opacity': 1,
        'z-index': 1
    }, fadeTime);

    setTimeout(function(){
        $('.tube').animate({'top': '45%'}, moveTime)
    }, fadeTime + pauseTime1)
    
    setTimeout(function(){
        $('.tube').css('opacity', 0);
    }, fadeTime + pauseTime1 + moveTime);

    // adapted from http://jsfiddle.net/UB2XR/23/
    $.fn.animateRotate = function(startAngle, endAngle, duration, easing, complete) {
      return this.each(function() {
        var $elem = $(this);

        $({deg: startAngle}).animate({deg: endAngle}, {
          duration: duration,
          easing: easing,
          step: function(now) {
            $elem.css({
               transform: 'rotate(' + now + 'deg)'
             });
          },
          complete: complete || $.noop
        });
      });
    };

    var k = 0;
    var startRotate = 0;
    var endRotate = 25;
    function rotateOccluder(){
        if(k < rotations){
            if(k==0){
                startRotate = 0;
                endRotate = 25;
            } else if(k==(rotations-1)){
                startRotate = -25;
                endRotate = 0;
            } else{
                if(endRotate == 25){
                    startRotate = 25;
                    endRotate = -25;
                } else if(endRotate == -25){
                    startRotate = -25;
                    endRotate = 25;
                }
            }            
            setTimeout(function(){
                $('#occluder').animateRotate(startRotate, endRotate, durRotate);
                k += 1;
                rotateOccluder();
            }, durRotate)
        }
    }
    setTimeout(function(){
        rotateOccluder()
    }, fadeTime + pauseTime1 + moveTime + durRotate);
    setTimeout(function(){
        if(trial.liarPlayer == "red"){
            orderTube("unordered", trial.liarPlayer, trial.drawnRed, expt.marbleSize);
        } else{
            orderTube("unordered", trial.liarPlayer, trial.drawnBlue, expt.marbleSize);
        }
        $('.tube').animate({'opacity': 1}, fadeTime);
    }, fadeTime + pauseTime1 + moveTime + totalRotate + pauseTime2)

    setTimeout(function(){
        $('.tube').animate({'top': '15%'}, moveTime);
        $('#occluder').animate({
            'opacity': 0,
            'z-index': 0
        }, fadeTime);
    }, fadeTime + pauseTime1 + moveTime + totalRotate + 2*pauseTime2 + fadeTime)

    setTimeout(function(){
        showChoices();
    }, fadeTime + pauseTime1 + moveTime + totalRotate + 2*pauseTime2 + 2*fadeTime)
}

function orderTube(type, player, number, marbleSize){
    if(player == "red"){
        var otherplayer = "blue";
    } else{
        var otherplayer = "red"
    }
    if(type=="choice"){
        var indexLab = "#"+type+number;
    } else if(type=="unordered"){
        var indexLab = "#tubesvg1"
    } else{
        var indexLab = "#tubesvg2"
    }
    for(var i=0; i<number; i++){
        marble(indexLab, player, marbleSize, ((i+1)/(expt.marblesSampled+1))*$(indexLab).width(), .5*$(indexLab).height());
    }
    for(var j=0; j<(expt.marblesSampled-number); j++){
        marble(indexLab, otherplayer, marbleSize, ((number+j+1)/(expt.marblesSampled+1))*$(indexLab).width(), .5*$(indexLab).height());
    }
}

function highlightChoice(choice){
    //if highlighted, unhighlighted
    if($('#choice'+choice).css('background-color')=='rgb(255, 255, 0)'){
        $('#choice'+choice).css('background-color','white');
        $('#nextDrawer').prop('disabled', true);
    } else{ //if unhighlighted, highlight
        //unhighlights all
        for(var i=0; i<=expt.marblesSampled; i++){
            $('#choice'+i).css('background-color','white');
        }
        $('#choice'+choice).css('background-color','rgb(255, 255, 0)');
        $('#nextDrawer').prop('disabled', false);
        trial.highlightedDrawn = choice;
    }
}

function showChoices(){
    $('#choices').css('opacity',1);
    $('#choices').css('z-index',1);

    if(expt.choiceArr == "twoRows"){
        //top row
        $('#choices').append("<div id=choiceTop></div>")
        for(var i=0; i<=expt.marblesSampled; i=i+2){
            $('#choiceTop').append("<svg class='choiceClass choiceClassTop' id='choice"+i+"' onclick='highlightChoice("+i+");'></svg>")
            orderTube("choice", trial.liarPlayer, i, expt.marbleSize);
        }
        //bottom row
        $('#choices').append("<div id=choiceBottom></div>")
        for(var j=1; j<=expt.marblesSampled; j=j+2){
            $('#choiceBottom').append("<svg class='choiceClass choiceClassBottom' id='choice"+j+"' onclick='highlightChoice("+j+");'></svg>")
            orderTube("choice", trial.liarPlayer, j, expt.marbleSize);
        }
    } else if(expt.choiceArr == "oneRow"){
        $('#choices').append("<div id=choiceMid></div>")
        for(var i=0; i<=expt.marblesSampled; i++){
            
            $('#choiceMid').append("<svg class='choiceClass choiceClassMid' id='choice"+i+"' onclick='highlightChoice("+i+");'></svg>")
            orderTube("choice", trial.liarPlayer, i, expt.marbleSize/2);
            $('#labelChoices').append("<div>"+i+"</div>");
            //$('#choice'+i).append("<text class='choiceTxt' x='20' y='20' font-family='sans-serif' font-size='20px'>"+i+"</text>");
        }
    }
    
    
    trial.responseStartTime = Date.now();
}

function report(){
    trial.responseTime = Date.now() - trial.responseStartTime;
    trial.reportedDrawn = trial.highlightedDrawn;
    if(trial.liarPlayer=="red"){
        trial.reportedRed = trial.reportedDrawn;
        trial.reportedBlue = expt.marblesSampled-trial.reportedDrawn;
    } else{
        trial.reportedBlue = trial.reportedDrawn;
        trial.reportedRed = expt.marblesSampled-trial.reportedDrawn;
    }

    if(trial.liarPlayer == "red"){
        var detectorPlayer = "blue";
    } else{
        var detectorPlayer = "red"
    }
    $('#detectorplayer').html(detectorPlayer);
    $('#detectorplayer').css('color', detectorPlayer);

    document.getElementById('trialDrawer').style.display = 'none';
    document.getElementById('switch').style.display = 'block';
}

function callout(call){
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
}

function addPoints(player, points, prevPoints){
    $('.'+player+"Pt").css({'top': '-15%'}, 1000);
    $('.'+player+"Pt").animate({'opacity': 1}, 250);
    if(points > 0){
        $('.'+player+"Pt").animate({'top': '10%'}, 1000);
    } else if(points < 0){
        $('.'+player+"Pt").animate({'top': '-40%'}, 1000);
    }
    
    maxPoints = expt.marblesSampled * expt.trials;
    setTimeout(function(){
        $('.'+player+"Pt").animate({'opacity': 0}, 250)
        $('#'+player+'UpdateScore').animate({
            'height': (points+prevPoints)/maxPoints*$('.updateBucket').height()
        }, 1000)
        $('.'+player+'Score').css('height', (points+prevPoints)/maxPoints*$('.updateBucket').height());
    }, 1250);
}


function keepTurn(){
    document.getElementById('keep').style.display = 'none';
    $('#nextKeep').prop('disabled',false);

    liar();
}

function switchTurn(){
    document.getElementById('switch').style.display = 'none';
    $('#nextPass').prop('disabled',false);
    detector();
}

function restartTrial(){
    $('.urn').css('opacity', 1);
    $('.tube').css('opacity', 1);
    $('.urnsvg').empty();
    $('.tubesvg').empty();
    
    trial.probabilityRed = expt.trialProbs; //can set this to a number that changes across trials
    trial.probabilityBlue = 1-trial.probabilityRed;
    
    fillUrn(250,trial.probabilityRed);

    trial.catch.key = -1;
    trial.catch.response = -1;
    trial.catch.responseTime = -1;
    $('#catchQ').hide();

    trial.startTime = Date.now();

    if(trial.trialNumber == 0){
        expt.stat.redTotalScore = 0;
        expt.stat.blueTotalScore = 0;
        $('.redScore').animate({
            'height': 0
        }, 500)
        $('.blueScore').animate({
            'height': 0
        }, 500)
    }
}

function liar() {
    document.getElementById('trialDrawer').style.display = 'block';
    var roletxt = "marble-picker"
    if(trial.exptPart == "practice"){
        $('.trialNum').html("Practice: You're the <i>" + roletxt + "</i>");
    } else{
        $('.trialNum').html("Round " + (trial.trialNumber+1) + ": You're the <i>" + roletxt + "</i>");
    }
    $('#nextDrawer').prop('disabled', true);
    document.getElementById('draw-button').setAttribute('onclick','drape();');
    $('#draw-button').html('Cover<br>Box');
    $('#choices').empty();
    $('#choices').css('opacity',0);
    $('#choices').css('z-index',0);
    $('#cover').css('top', '-10%');
    $('.tube').css('top', '80%');
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
    document.getElementById('trialResponder').style.display = 'block';
    var roletxt = "decider"
    if(trial.exptPart == "practice"){
        $('.trialNum').html("Practice: You're the <i>" + roletxt + "</i>");
    } else{
        $('.trialNum').html("Round " + (trial.trialNumber+1) + ": You're the <i>" + roletxt + "</i>");
    }
    
    $('#nextResponder').prop('disabled', true);
    $('.callout-button').css('opacity','0.8');
    $('.callout-button').prop('disabled', false);
    trial.roleCurrent = "detector"

    restartTrial();
    orderTube("reported", trial.liarPlayer, trial.reportedDrawn, expt.marbleSize);
}

function trialDone() {
    // hide trial.
    document.getElementById('trialResponder').style.display = 'none';
    document.getElementById('keep').style.display = 'block';
    $('#keepDiv').css('opacity',0);

    trial.trialTime = Date.now() - trial.startTime;
    trial.trialNumber += 1;

    if(trial.trialNumber > 0){
        if(!trial.callBS){
            trial.redTrialScore = trial.reportedRed;
            trial.blueTrialScore = trial.reportedBlue;
        } else{
            if(trial.liarPlayer == "red"){
                if(trial.reportedRed == trial.drawnRed){
                    trial.redTrialScore = trial.reportedRed;
                    trial.blueTrialScore = trial.reportedBlue - 3;
                } else{
                    trial.redTrialScore = 0;
                    trial.blueTrialScore = expt.marblesSampled;
                }
            } else{
                if(trial.reportedBlue == trial.drawnBlue){
                    trial.blueTrialScore = trial.reportedBlue;
                    trial.blueTrialScore = trial.reportedRed - 3;
                } else{
                    trial.blueTrialScore = 0;
                    trial.redTrialScore = expt.marblesSampled;
                }
            }
        }

        addPoints("red", trial.redTrialScore, expt.stat.redTotalScore);
        addPoints("blue", trial.blueTrialScore, expt.stat.blueTotalScore);

        expt.stat.redTotalScore += trial.redTrialScore;
        expt.stat.blueTotalScore += trial.blueTrialScore;
    }

    recordData();

    if(trial.exptPart == "practice"){
        trial.trialNumber = 0;
        trial.exptPart = 'trial';

        setTimeout(function(){
            $('.trialNum').html("Round " + (trial.trialNumber+1) + "<br><br>Ready to play?");
        }, 2000)
        
    } else if(trial.trialNumber  == expt.trials){
        $('#keepDiv').hide();
        document.getElementById('nextKeep').setAttribute('onclick','toWinnerCircle();');
    } else {
        setTimeout(function(){
            if(trial.liarPlayer == 'red'){
                trial.liarPlayer = 'blue';
            } else{
                trial.liarPlayer = 'red';
            }
            $('.trialNum').html("Round " + (trial.trialNumber+1));
            $('#liarplayer').html(trial.liarPlayer);
            $('#liarplayer').css('color', trial.liarPlayer);
            $('#keepDiv').css('opacity',1);
        }, 2000)
        
    }
}

function toWinnerCircle(){
    document.getElementById('keep').style.display = 'none';
    if(expt.stat.redTotalScore == expt.stat.blueTotalScore){
        $('#whowon').html("You tied!");
    } else if(expt.stat.redTotalScore > expt.stat.blueTotalScore){
        $('#whowon').html("<b style='color:red'>Red</b> won the game!");
    } else{
        $('#whowon').html("<b style='color:blue'>Blue</b> won the game!");
    }

    //$('.scoreboardDiv').show();

    $('.redFinalScore').html(expt.stat.redTotalScore);
    $('.blueFinalScore').html(expt.stat.blueTotalScore);

    // expt done
    data = {client: client, expt: expt, trials: trialData};
    writeServer(data);

    document.getElementById('completed').style.display = 'block';
}


function experimentDone() {
    submitExternal(client);
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
        exptPart: trial.exptPart,
        trialNumber: trial.trialNumber,
        liarPlayer: trial.liarPlayer,
        marblesSampled: expt.marblesSampled,
        probabilityRed: trial.probabilityRed,
        drawnRed: trial.drawnRed,
        drawnBlue: trial.drawnBlue,
        reportedDrawn: trial.reportedDrawn,
        callBS: trial.callBS,
        playerTrialScore: trial.playerTrialScore,
        oppTrialScore: trial.oppTrialScore,
        playerTotalScore: expt.stat.playerTotalScore,
        oppTotalScore: expt.stat.oppTotalScore,
        responseTime: trial.responseTime,
        catchQuestion: trial.catch.question,
        catchKey: trial.catch.key,
        catchResponse: trial.catch.response,
        catchResponseTime: trial.catch.responseTime,
        trialTime: trial.trialTime
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

// function distributePseudo(totalTrials, minArrPseudo, maxArrPseudo){
//     var pseudoDict = {};
//     var arrPseudo = [];
//     var bucketOdd = [];

//     for(var a=minArrPseudo; a <= maxArrPseudo; a++){
//         arrPseudo.push(a);
//     }
//     for(var i=0; i<=totalTrials/2; i++){
//         bucketOdd.push(i);
//     }
//     var bucketEven = bucketOdd.slice(0);

//     for(var o=0; o<arrPseudo.length; o++){
//         index = Math.floor(randomDouble(0, bucketOdd.length));
//         pseudoDict[(2*bucketOdd.splice(index, 1)[0]+1)] = arrPseudo[o];
//     }
//     for(var e=0; e<arrPseudo.length; e++){
//         index = Math.floor(randomDouble(0, bucketEven.length));
//         pseudoDict[(2*bucketEven.splice(index, 1)[0])] = arrPseudo[e];
//     }
//     return(pseudoDict);
// }

// function submitCatch(){
//     trial.catch.responseTime = Date.now() - trial.catch.responseStartTime;
//     $('input[type=text]').prop('disabled',true);
//     $('input[type=text]').css('opacity','0.7');
//     $('#catch-button').prop('disabled', true);
//     var timeoutTime = 0;
//     if(trial.catch.key == trial.catch.response){
//         $('#catchQ').append('<img src="img/yup.png" height=18 vertical-align="middle" hspace="20">');
//     } else{
//         $('#catchQ').append('<img src="img/nah.png" height=18 vertical-align="middle" hspace="20">');
//         timeoutTime = 3000;
//     }
//     setTimeout(function(){
//         if(trial.exptPart == 'practice' | (trial.trialNumber + 1) % 5 == 0){
//             $('.scoreboardDiv').css('opacity','1');
//         } 
//         $('.scoreReport').css('opacity','1');
//         $('#nextScoreboard').css('opacity','1');
//     }, timeoutTime);
// }

// function catchTrial(role, exptPart){
//     if(role == 'liar'){
//         trial.catch.question = 'How many red marbles did you actually draw?'
//         trial.catch.key = trial.drawnRed;
//     } else{
//         trial.catch.question = 'How many red marbles did your opponent report drawing?'
//         trial.catch.key = trial.reportedDrawn;
//     }
//     $('#catchQ').html('<label>'+trial.catch.question+'</label>');
//     $('#catchQ').append('<input type="text" id="reportCatch" value="" size="2" maxlength="2" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/> <button class="active-button" id="catch-button" type="button" onclick="submitCatch();">Submit</button> ');

//     $('#catch-button').prop('disabled',true);
//     $('input[type=text]').on('input',
//         function(){
//             trial.catch.response = parseInt($(this).val());
//             if(trial.catch.response >= 0 && trial.catch.response <= 10 ){
//                 $('#catch-button').prop('disabled',false);
//             } else{
//                 $('#catch-button').prop('disabled',true);
//             }
//     });

//     $('.scoreReport').css('opacity','0');
//     $('.scoreboardDiv').css('opacity','0');
//     $('#nextScoreboard').css('opacity','0');
// }







