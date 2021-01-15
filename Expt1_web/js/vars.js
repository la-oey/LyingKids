var saveInfo = {
    dataURL: 'save.json.php', //'https://madlab-research.ucsd.edu/save.json.php',  //
    //videoURL: 'submit.video.php',
    imgURL: 'save.image.php', //'https://madlab-research.ucsd.edu/save.image.php', //
    experimenter: 'loey',
    experimentName: 'trick-or-truth-2'
}

var params = {
    minAge: 4,
    maxAge: 12,
    minWindowWidth: 980,
    minWindowHeight: 634
}

// experiment settings
var expt = {
    trials: 20,
    marblesSampled: 6, //total number of marbles drawn per trial
    numPerDrawn: 2,
    marbleSize: 15,
    roles: ['liar', 'detector'],
    roleFirst: ['liar', 'detector'],
    human:{
        color: ['red', 'blue']
    },
    comp: {
        color: ['red', 'blue'],
        gender: ['female', 'red']
    },
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
    sona: {
        experiment_id: 2004,
        credit_token: '7f5b765e48fa4831b948bc9281a2968b'
    },
    debug: false // false //
};
var trial = {
    exptPart: 'practice', //parts: {'practice','trial'}
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
    scoreHeight: {
        "red": 0,
        "blue": 0,
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

var yaAudio = new Audio("audio/correct.wav");
var noAudio = new Audio("audio/incorrect.wav");
var dropAudio = new Audio("audio/drop.wav");
var dropAudio2 = new Audio("audio/drop.wav");
var dropAudio3 = new Audio("audio/drop.wav");
var waitAudio = new Audio("audio/wait.wav");
var chooseAudio = new Audio("audio/choose.wav");
var pointsAudio = new Audio("audio/points.wav");
var shakeAudio = new Audio('audio/shake.wav');
var winnerAudio = new Audio('audio/winner.wav');
var sayAudio = {
    ShakeTheBox: new Audio("audio/say_ShakeTheBox.wav"),
    // Report: null,
    TrickOrTruth: new Audio("audio/say_TrickOrTruth.wav"),
    OpponentDecided: new Audio("audio/say_OpponentDecided.wav"),
    Points: new Audio("audio/say_Points.wav"),
    OpponentReported: null
}
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


var no_replay = [
    "shake_all_red", "shake_all_blue",
    "shake_all_red_again", "shake_all_blue_again",
    "shake_q_all_red", "shake_q_all_blue",
    "shake_no_red", "shake_no_blue",
    "shake_true_red", "shake_true_blue",
    "prompt_truth_red", "prompt_truth_blue", 
    "prompt_trick", "prompt_again",
    "start_red_liar", "start_red_detector", "start_blue_liar", "start_blue_detector",
    "switch_red_liar", "switch_red_detector", "switch_blue_liar", "switch_blue_detector"
];

var vidColors =  [
    "opponent", "screenRecord", 
    "shake_all", "shake_no", "shake_true", 
    "decide_switch", "decide_opponentlie",
    "prompt_truth"
    ];