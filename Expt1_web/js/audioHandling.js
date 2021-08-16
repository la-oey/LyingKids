


var setGoAudioRecording = function(){
	$("#recordSignal").remove();
	$("#recordButton").off('click');
	$("#recordButton").html("Record!");
	$("#recordButton").on('click', startAudioRecording);
}

var setStopAudioRecording = function(){
	$("#recordButton").off('click');
	$("#recordButton").html("Stop!");
    $("#recordButton").on('click', stopAudioRecording);
}


let rerecord = false;
let flashLetters;
var gumStream;
//stream from getUserMedia() 
var rec;
//Recorder.js object 
var input;
//MediaStreamAudioSourceNode we'll be recording 
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext;

function startAudioRecording(){
	let constraints = {
	    audio: true,
	    video: false
	} 
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
	    /* assign to gumStream for later use */
	    gumStream = stream;
	    /* use the stream */
	    input = audioContext.createMediaStreamSource(stream);
	    /* Create the Recorder object and configure to record mono sound (1 channel) */
	    rec = new Recorder(input, {
	        numChannels: 1
	    }) 
	    
		//start the recording process 
	    rec.record()
	    console.log("Recording started");
	    setTimeout(function(){
			stopAudioRecording();
		}, 10000); // max 10 seconds to record
	}).catch(function(err) {
	    debugLog("error " + error);
	});


    if(rerecord){
    	$("#prevAud").remove();
    }
    animateRecord(); //shows audio recording animation
    setStopAudioRecording();
}

function animateRecord(){
	let recordText = "<div id='l0' class='letterAnim'>R</div>" + 
					 "<div id='l1' class='letterAnim'>E</div>" + 
					 "<div id='l2' class='letterAnim'>C</div>" +
					 "<div id='l3' class='letterAnim'>O</div>" + 
					 "<div id='l4' class='letterAnim'>R</div>" + 
					 "<div id='l5' class='letterAnim'>D</div>" +
					 "<div id='l6' class='letterAnim'>I</div>" + 
					 "<div id='l7' class='letterAnim'>N</div>" + 
					 "<div id='l8' class='letterAnim'>G</div>" +
					 "<div id='l9' class='letterAnim'>.</div>" +
					 "<div id='l10' class='letterAnim'>.</div>" +
					 "<div id='l11' class='letterAnim'>.</div>";
    $("#recordButton").after("<br><br><br><div id='recordSignal'>" + recordText + "</div>");

    let flashedID = 0;
    flashLetters = setInterval(function(){ // hopping letters one by one
    	// $(".letterAnim").css('opacity', 0.5); // letter flashing instead
    	// $("#l"+flashedID).css('opacity', 1);
    	$(".letterAnim").css('margin-top', '0px');
    	if(flashedID <= 11){
    		$("#l"+flashedID).css('margin-top', '-10px');
    	}
    	if(flashedID == 13){
    		flashedID = 0;
    	} else{
    		flashedID++;
    	}
    }, 150);
}

function stopAudioRecording(){
	if(rec.recording){
		debugLog("stopped recording!")
		rec.stop();
		gumStream.getAudioTracks()[0].stop();
		rec.exportWAV(preview);
	} else{
		debugLog("cannot stop when not recording");
	}

	clearInterval(flashLetters);
	setGoAudioRecording();
}

function preview(blob) {
    var audData = URL.createObjectURL(blob);
    let htmlPreview = "<div id='prevAud'><br><br><audio id='voice' controls=true src=" + audData +"/></div>";
    $("#recordButton").after(htmlPreview); //shows audio recording
    rerecord = true;

    writeAudServer(blob);
    allowMoveOn();
}




function writeAudServer(blob){
	debugLog('initiate server audio write');
	var xhr = new XMLHttpRequest();
    xhr.onload = function(e){
    	if(this.readyState === 4){
    		console.log("Server returned: ", e.target.responseText);
    	}
    }
    var fd = new FormData();
    let filename = client.sid;
    fd.append("audio_data", blob, filename);
    fd.append("experimenter", saveInfo.experimenter);
    fd.append("experimentName", saveInfo.experimentName);
    xhr.open("POST", saveInfo.audURL, true);
    xhr.send(fd);
}

function allowMoveOn(){
	$("#letsgo").prop('disabled', false);
    blink("letsgo", colors.nextblink, 20, 2, 3000, true);
}





