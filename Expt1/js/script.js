// https://ucsd.sona-systems.com/webstudy_credit.aspx?experiment_id=1465&credit_token=c6393dd431374ab48035c7fafafced2e&survey_code=XXXX
// experiment settings
var expt = {
    saveURL: 'submit.simple.php',
    trials: 20, //switched from 100
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
    },
    debug: true
};
var trial = {
    exptPart: 'instruct', //parts: {'instruct', 'practice','trial'}
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
var instruct = [
    {id:"instructImg0", src:"img/marblebox.png"},
    {id:"instructImg1", src:"img/marblebox.png"},
    {id:"instructImg2", src:"img/redblueteam.png"},
    {id:"instructImg3", src:"img/trick.png"},
    {id:"instructImg4", src:"img/redblueaccept.png"},
    {id:"instructImg5", src:"img/redbluecatch.png"},
    {id:"instructImg6", src:"img/redblueaccus.png"}
]


// TODO, Potentially: pick randomly between human/threePoints instructions.
function pageLoad() {
    //document.getElementById('instructions').style.display = 'block'; //CHANGE BACK
    expt.trialProbs = sample(expt.allTrialProbs);
    //expt.humanColor = sample(expt.humanColor); //assigns human to play as red or blue
    
    document.getElementById('pickColor').style.display = 'block';
    $('#continueColor').prop('disabled',true);
}

function pickCol(color){
    if(color == 'red'){
        $('#red-button').css('opacity','1');
        $('#blue-button').css('opacity','0.5');
        expt.humanColor = "red";
        expt.compColor = "blue";
    } else{
        $('#blue-button').css('opacity','1');
        $('#red-button').css('opacity','0.5');
        expt.humanColor = "blue";
        expt.compColor = "red";
    }
    $('#continueColor').prop('disabled',false);

}

function clickColor() {
    document.getElementById('pickColor').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
    $('#continueInstruct').prop('disabled', true);
    $('#continueInstruct').css('opacity', 0);
    $('#left-move').css('opacity',0.2);
    trial.liarPlayer = expt.humanColor;
    $('.tube').hide();
    if(expt.humanColor == "blue"){
        instruct[2]['src'] = "img/blueredteam.png";
        instruct[4]['src'] = "img/blueredaccept.png";
        instruct[5]['src'] = "img/blueredcatch.png";
        instruct[6]['src'] = "img/blueredaccus.png";
        $('.leftBucket').html('<img class="imgPt bluePt blueTrialPt" src="img/bluepoint.png" width="100%"><div class="playerScore blueScore"></div>');
        $('.rightBucket').html('<img class="imgPt redPt redTrialPt" src="img/redpoint.png" width="100%"><div class="playerScore redScore"></div>');
        $('#leftUpdateBucket').html('<img class="imgPt bluePt blueTrialPt" src="img/bluepoint.png" width="100%"><div class="playerScore blueScore" id="blueUpdateScore"></div>');
        $('#rightUpdateBucket').html('<img class="imgPt redPt redTrialPt" src="img/redpoint.png" width="100%"><div class="playerScore redScore" id="redUpdateScore"></div>');
        $('#leftInstrBucket').html('<img class="imgPt bluePt" id="blueInstrPt" src="img/bluepoint.png" width="100%"><div class="playerScore blueScore" id="blueInstrScore"></div>');
        $('#rightInstrBucket').html('<img class="imgPt redPt" id="redInstrPt" src="img/redpoint.png" width="100%"><div class="playerScore redScore" id="redInstrScore"></div>');
    }
    $('.scoreInstrBucket').hide();
}

function nextInstruct(currentInstruct) {
    var currentNum = parseInt(currentInstruct, 10);
    var nextNum = currentNum+1;
    document.getElementById('left-move').setAttribute('onclick','prevInstruct('+nextNum+');');
    document.getElementById('right-move').setAttribute('onclick','nextInstruct("'+nextNum+'");');
    $('#instructImageDiv').html("<img class='instructImages' id='"+instruct[nextNum]['id']+"' src='"+instruct[nextNum]['src']+"'>");
    if(nextNum > 3){ //reset score bucket
        $('#redInstrScore').css('height', '15%');
        $('#blueInstrScore').css('height', '15%');
        $('#left-move').css('opacity', 0.2);
        document.getElementById('left-move').setAttribute('onclick','');
        $('#right-move').css('opacity', 0.2);
        document.getElementById('right-move').setAttribute('onclick','');
        setTimeout(function(){
            document.getElementById('left-move').setAttribute('onclick','prevInstruct('+nextNum+');');
            $('#left-move').css('opacity', 1);
            if(nextNum != Object.keys(instruct).length-1){
                document.getElementById('right-move').setAttribute('onclick','nextInstruct("'+nextNum+'");');
                $('#right-move').css('opacity', 1);
            }
        }, 2500);
    }
    if(nextNum == 1){
        turn.numDrawn = 0;
        $('.tubesvg').empty();
        $('.marblesvg').empty();
        $('.sampMarble').css('top', '-80%');
        $('#left-move').css('opacity', 1);
        $('.tube').show();
        $('#left-move').css('opacity', 0.2);
        document.getElementById('left-move').setAttribute('onclick','');
        $('#right-move').css('opacity', 0.2);
        document.getElementById('right-move').setAttribute('onclick','');
        draw();
    } else if(nextNum == 2){
        $('.tube').css('top', '68%');
        $('.tube').hide();
    } else if(nextNum == 4){
        $('.scoreInstrBucket').show();
        addPoints(expt.humanColor, 5, 3);
        addPoints(expt.compColor, 1, 3);
    } else if(nextNum == 5){
        addPoints(expt.humanColor, 0, 3);
        addPoints(expt.compColor, 6, 3);
    } else if(nextNum == 6){
        addPoints(expt.humanColor, 5, 3);
        addPoints(expt.compColor, -2, 3);
    }

    if(nextNum == Object.keys(instruct).length-1){
        //$('#right-move').css('opacity', 0.2);
        //document.getElementById('right-move').setAttribute('onclick','');
        $('#continueInstruct').prop('disabled', false);
        $('#continueInstruct').css('opacity', 1);
    } 
    
}

function prevInstruct(currentInstruct) {
    var currentNum = parseInt(currentInstruct, 10);
    var prevNum = currentNum-1;
    document.getElementById('left-move').setAttribute('onclick','prevInstruct("'+prevNum+'");');
    document.getElementById('right-move').setAttribute('onclick','nextInstruct('+prevNum+');');
    $('#instructImageDiv').html("<img class='instructImages' id='"+instruct[prevNum]['id']+"' src='"+instruct[prevNum]['src']+"'>");
    if(prevNum > 3){ //reset score bucket
        $('#redInstrScore').css('height', '15%');
        $('#blueInstrScore').css('height', '15%');
        $('#left-move').css('opacity', 0.2);
        document.getElementById('left-move').setAttribute('onclick','');
        $('#right-move').css('opacity', 0.2);
        document.getElementById('right-move').setAttribute('onclick','');
        setTimeout(function(){
            document.getElementById('left-move').setAttribute('onclick','prevInstruct('+prevNum+');');
            $('#left-move').css('opacity', 1);
            document.getElementById('right-move').setAttribute('onclick','nextInstruct("'+prevNum+'");');
            $('#right-move').css('opacity', 1);
        }, 2500);
    }
    if(prevNum == 0){
        $('#left-move').css('opacity', 0.2);
        document.getElementById('left-move').setAttribute('onclick','');
        $('.tube').css('top', '68%');
        $('.tube').hide();
    } else if(prevNum == 1){
        turn.numDrawn = 0;
        $('.tubesvg').empty();
        $('.marblesvg').empty();
        $('.sampMarble').css('top', '-80%');
        $('.tube').css('top', '68%');
        $('.tube').show();
        $('#instructImg1').css('opacity',1);
        $('#left-move').css('opacity', 0.2);
        document.getElementById('left-move').setAttribute('onclick','');
        $('#right-move').css('opacity', 0.2);
        document.getElementById('right-move').setAttribute('onclick','');
        draw();
    } else if(prevNum == 3){
        $('.scoreInstrBucket').hide();
    } else if(prevNum == 4){
        addPoints(expt.humanColor, 5, 3);
        addPoints(expt.compColor, 1, 3);
    } else if(prevNum == 5){
        addPoints(expt.humanColor, 0, 3);
        addPoints(expt.compColor, 6, 3);
    } else if(prevNum == 6){
        addPoints(expt.humanColor, 5, 3);
        addPoints(expt.compColor, -2, 3);
    }

    if(prevNum == Object.keys(instruct).length - 2){
        $('#continueInstruct').prop('disabled', true);
        $('#continueInstruct').css('opacity', 0);
    } 
    
}



function clickInstruct() {
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('prePractice').style.display = 'block';
    $('.tube').show();
    $('.tubesvg').empty();
    $('.marblesvg').empty();
    $('.sampMarble').css('top', '-80%');
    trial.exptPart = "practice";
}

function clickPrePractice(){
    document.getElementById('prePractice').style.display = 'none';
    //expt.catchTrials = distributeChecks(expt.practiceTrials, 0.50); // 0.5 of practice trials have an attention check
    document.getElementById('keep').style.display = 'block';
    $('.trialNum').html("Start!");
    trial.liarPlayer = expt.humanColor;
    $('#liarplayer').html(trial.liarPlayer);
    $('#liarplayer').css('color', trial.liarPlayer);
    $('.trialNum').html("Practice: <i>Marble-Picker</i>");
    $('.redScore').css('height', 0);
    $('.blueScore').css('height', 0);
}

function clickPostPractice(){
    document.getElementById('postPractice').style.display = 'none';
    document.getElementById('keep').style.display = 'block';

    //expt.catchTrials = distributeChecks(expt.trials, 0.10); // 0.1 of expt trials have an attention check
    expt.pseudo = distributePseudo(expt.trials);
    expt.roleFirst = sample(expt.roles);
    trial.roleCurrent = expt.roleFirst;
    debugLog(trial.roleCurrent);
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
}

// function fillUrn(totalMarbles, probability) {
//     var exactRed = Math.round(totalMarbles * probability);
//     var exactBlue = totalMarbles - exactRed;

//     for(var i=0; i<totalMarbles; i++){
//         var color = "blue";

//         // balls in urn correspond to exact probability distribution, i.e. no random sampling
//         if(Math.random() < (exactRed/(exactRed + exactBlue))){
//             color = "red"
//             trial.urnRed += 1;
//             exactRed -= 1;
//         } else{
//             trial.urnBlue += 1;
//             exactBlue -= 1;
//         }

//         marble(".urnsvg", color, expt.marbleSize, randomDouble(.07*$('.suburn').width(), .93*$('.suburn').width()), randomDouble(.07*$('.suburn').height(), .93*$('.suburn').height()));
//     }
//     $('#draw-button').animate({'opacity': 1});
// }

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
        } else{
            for(var i=0; i<expt.marblesSampled; i++){
                if(Math.random() < trial.probabilityRed){
                    trial.drawnRed += 1;
                } else{
                    trial.drawnBlue += 1;
                }
            }
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
    document.getElementById('draw-button').setAttribute('onclick','');

    for(var i=0; i<2; i++){
        $('.cover').animate({
            "top": "9%"
        })
        $('.cover').animate({
            "top": "12%"
        })
    }
    var audio = new Audio('audio/shake.wav');
    setTimeout(function(){
        audio.play();
    }, 800);

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
        }
    }

    function multDraws(){
        var initDrawDelay = 3000;
        var subsDrawDelay = 500;
        var moveTime = 1000;
        var showChoiceTime = 1500;
        if(turn.numDrawn == expt.marblesSampled){
            document.getElementById('draw-button').setAttribute('onclick','');
            setTimeout(function(){
                $('.cover').animate({
                    'opacity': 0,
                    'z-index': 0
                }, 1000);
                $('.tube').animate({'top': '15%'}, moveTime);
                if(trial.exptPart == "instruct"){
                    setTimeout(function(){
                        $('#left-move').css('opacity', 1);
                        document.getElementById('left-move').setAttribute('onclick','prevInstruct("1");');
                        $('#right-move').css('opacity', 1);
                        document.getElementById('right-move').setAttribute('onclick','nextInstruct("1");');
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
        //report(); //maybe switch back to button?
        //$('#choices').css('opacity',0);
        //$('#choices').css('z-index',0);
    }

    if(trial.exptPart == "practice"){
        practiceChoiceSeq.push(choice);
        var checkAll = -1;
        var checkNone = -1;
        var checkTrue = -1;
        for(var i=0; i<practiceChoiceSeq.length; i++){
            if(practiceChoiceSeq[i] == "6"){
                checkAll = i;
            } else if(practiceChoiceSeq[i] == "0" & i > checkAll){
                checkNone = i;
            } else if(practiceChoiceSeq[i] == "3" & i > checkNone){
                checkTrue = i;
            }
        }
        if(checkAll != -1 & checkNone != -1 & checkTrue != -1){
            $('#nextDrawer').prop('disabled', false);
        } else{
            $('#nextDrawer').prop('disabled', true);
        }
    }
}

function showChoices(){
    $('#choices').css('opacity',1);
    $('#choices').css('z-index',1);

    $('#choices').append("<div id=choiceMid></div>")
    for(var i=0; i<=expt.marblesSampled; i++){
        $('#choiceMid').append("<div class='choiceClass choiceClassMid' id='choice"+i+"' onclick='highlightChoice("+i+");'><img id='choice"+i+"' class='choiceImg' src='img/"+trial.liarPlayer+i+".png' height='200'/></div>");
        // $('#choiceMid').append("<svg class='choiceClass choiceClassMid' id='choice"+i+"' onclick='highlightChoice("+i+");'></svg>")
        // orderTube("choice", trial.liarPlayer, i, expt.marbleSize);
        // $('#labelChoices').append("<div>"+i+"</div>");

        //$('#choice'+i).append("<text class='choiceTxt' x='20' y='20' font-family='sans-serif' font-size='20px'>"+i+"</text>");
    }
    $('#nextDrawer').css('opacity',1);
    
    trial.responseStartTime = Date.now();
}

function report(){
    trial.responseTime = Date.now() - trial.responseStartTime;
    trial.reportedDrawn = trial.highlightedDrawn;
    $('#nextDrawer').prop('disabled', true);
    $('#nextDrawer').css('opacity', 0);
    $('#choices').css('opacity',0);
    $('#choices').css('z-index',0);

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
        
        trial.waitTime = 1000 + 3000*exponential(0.75);
        setTimeout(function(){
            clearInterval(trial.timer);
            $('.subjResponse').html("<p><br>They decided!<br><br></p>")
            $('.subjResponse').css('opacity','1');
            computerDetect();
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
    trial.compDetect = cbinom(expt.marblesSampled, trial.probabilityRed, trial.reportedDrawn) - (cbinom(expt.marblesSampled, trial.probabilityRed, (expt.marblesSampled*trial.probabilityRed)) - 0.5) //lowers prob of celling out by centering cbinom at expected mean
    trial.compLie = -1;
    //console.log("CompDetect: " + trial.compDetect)
    if(Math.random() < trial.compDetect){
        trial.callBS = true;
    }
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
    document.getElementById('trialResponder').style.display = 'none';
    trialDone();
}

function addPoints(player, points, prevPoints){    
    if(trial.exptPart == "trial"){
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

        setTimeout(function(){
            $('#nextKeep').prop('disabled',false);
        }, 3000);
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
    if(trial.exptPart == "practice"){
        if(trial.roleCurrent == "liar" & trial.trialNumber == 0){
            trial.liarPlayer = expt.humanColor;
            liar();
        } else{
            if(trial.trialNumber == 1){
                trial.liarPlayer = expt.compColor;
                restartTrial();
                detector();
            } else{
                document.getElementById('postPractice').style.display = 'block';
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



function liar() {
    document.getElementById('trialDrawer').style.display = 'block';
    $('#nextDrawer').prop('disabled', true);
    $('#nextDrawer').css('opacity',0);
    document.getElementById('draw-button').setAttribute('onclick','draw();');
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
    document.getElementById('trialResponder').style.display = 'block';
    
    $('#nextResponder').prop('disabled', true);
    trial.roleCurrent = "detector";
    $('.tube').css('top', '15%');
    $('.subjResponse').css('opacity','1');
    $('.callout-button').css('opacity','0');
    
    function detectWait() {
        flickerWait();
        
        trial.waitTime = 3000 + 6000*exponential(0.75);
        setTimeout(function(){
            clearInterval(trial.timer);
            $('.subjResponse').css('opacity','0');
            computerReport();
            orderTube("detectRep", trial.liarPlayer, trial.reportedDrawn, expt.marbleSize);
            $('.callout-button').css('opacity','0.8');
            $('.callout-button').prop('disabled', false);
            trial.responseStartTime = Date.now();
        }, trial.waitTime);
    }
    detectWait();
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

    if(trial.exptPart == "practice"){
        $("#tubesvg1").css('opacity',1);
        trial.reportedDrawn = 6;
    } else if(expt.pseudo[trial.trialNumber] != -1){
        trial.reportedDrawn = expt.pseudo[trial.trialNumber];
    } else{
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
            //console.log("CompLie: " + trial.compLie)
        }
    }
    if(expt.humanColor == 'red'){
        trial.reportedBlue = trial.reportedDrawn;
        trial.reportedRed = expt.marblesSampled - trial.reportedDrawn;
    } else{
        trial.reportedRed = trial.reportedDrawn;
        trial.reportedBlue = expt.marblesSampled - trial.reportedDrawn;
    }

    debugLog("computer report: " + trial.reportedDrawn);

}

function trialDone() {
    document.getElementById('keep').style.display = 'block';
    $('#keepDiv').css('opacity',0);
    $('#nextKeep').prop('disabled',true);

    trial.trialTime = Date.now() - trial.startTime;
    trial.trialNumber += 1;

    if(trial.exptPart == "trial"){
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


        if(trial.trialNumber%5 == 0){
            addPoints("red", expt.stat.redRunningScore, expt.stat.redTotalScore);
            addPoints("blue", expt.stat.blueRunningScore, expt.stat.blueTotalScore);
            expt.stat.redTotalScore += expt.stat.redRunningScore;
            expt.stat.blueTotalScore += expt.stat.blueRunningScore;
            expt.stat.redRunningScore = 0;
            expt.stat.blueRunningScore = 0;
        } else{
            setTimeout(function(){
                $('#nextKeep').prop('disabled',false);
            }, 1000);
        }
    }

    recordData();

    if(trial.exptPart == "practice"){
        setTimeout(function(){
            $('#nextKeep').prop('disabled',false);
        }, 1000);
        if(trial.roleCurrent == "liar"){
            trial.liarPlayer = expt.compColor;
            $('#liarplayer').html(trial.liarPlayer);
            $('#liarplayer').css('color', trial.liarPlayer);
            trial.roleCurrent = "detector";
        }
        
    } else if(trial.trialNumber == expt.trials){
        $('#keepDiv').hide();
        document.getElementById('nextKeep').setAttribute('onclick','toWinnerCircle();');
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
    } else{
        $('.trialNum').html("Round " + (trial.trialNumber+1) + ": <i>" + roletxt + "</i>");
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







