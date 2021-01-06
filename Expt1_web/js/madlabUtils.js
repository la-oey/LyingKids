var demographicClient = { //filled out by participant
	consent: false,
	parentName: "",
	childName: "",
	DOB: "",
	country: "",
	gender: "",
	firstLang: "",
	English: "",
	hearing: "",
	hearingExplain: "",
	vision: "",
	visionExplain: "",
	videoaudio: "",
	audioonly: "",
	stillimages: "",
	imageAllowed: "",
	futureEmail: "",
	futurePhone: "",
	otherName: "",
	otherDOB: "",
	contactEmail: "",
	comments: ""
}

function checkText(question, defaultA){
	return($('input[name = "'+question+'"]').val() != defaultA);
}

function checkCheckbox(question){
	return($('input[name = "'+question+'"]').prop("checked"));
}

function checkRadio(question){
	return($('input[name = "'+question+'"]:checked').val() != null);
}

function checkDOB(dob, yearMin, yearMax){
	let birthdate = new Date($('input[name = "'+dob+'"]').val());
	let todaydate = new Date();
	let years = todaydate.getFullYear() - birthdate.getFullYear();
	let months = years*12 + todaydate.getMonth() - birthdate.getMonth();
	let minMonth = yearMin*12;
	let maxMonth = (yearMax + 1)*12;
	return(months >= minMonth & months < maxMonth)
}

function checkEmail(email){
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var lowerCaseEmail = $('input[name = "'+email+'"]').val().toLowerCase();
    return(re.test(lowerCaseEmail) || lowerCaseEmail == "not interested");
}

function checkPhone(phone){
	return($('input[name = "'+phone+'"]').val().length >= 14);
}

function reformatPhone(){
	$("input[name='phone']").val($("input[name='phone']").val().replace(/^(\d{3})(\d{3})(\d{4})+$/, "($1) $2-$3"));
}

function openExplain(value){
	$('#'+value+"Explain").prop("disabled",false);
}

function closeExplain(value){
	$('#'+value+"Explain").prop("disabled",true);
}



function checkWindowDimensionsDynamic(minWidth, minHeight) {
	var minArea = minWidth*minHeight;

    function assessWindowSize() {
        let dynWidth = $(window).width();
        let dynHeight = $(window).height();
        debugLog("width: " + dynWidth + ", height: " + dynHeight);
        var dynArea = dynWidth*dynHeight;
        
        if(dynWidth >= minWidth & dynHeight >= minHeight) {
        	$("#windowGradient").css('opacity', 1);
        	$("#windowBinary").css('opacity', 1);
        	$("#windowCheckTxt").html("Your window size is large enough to continue with the study! Please do not reduce the window size during the study.")
        	$("#windowCheckTxt").css("color","green");
        	$("#continueSetup").prop('disabled', false);
        	$("#continueSetup").css('display', 'block');
        } else{
        	//$("#windowGradient").css('opacity', Math.pow(dynArea/minArea,2));
        	$("#windowGradient").css('opacity', 0.8*dynArea/minArea);
        	$("#windowBinary").css('opacity', 0);
        	$("#windowCheckTxt").html("To continue to the study, please enlarge the window size until the bird gets brighter and the sunglasses appear (or enter full screen mode).");
        	$("#windowCheckTxt").css("color","red");
        	$("#continueSetup").prop('disabled', true);
        	$("#continueSetup").css('display', 'none');
        }
    };
    
    window.onresize = assessWindowSize;
    window.onload = assessWindowSize();
}

function checkOrientation(){ //mode = {'portrait','landscape'}
	function assessOrientation(){
	    if(Math.abs(window.orientation) == 90){
	        $('#continuePreSetup').prop('disabled', false);
	    } else{
	        $('#continuePreSetup').prop('disabled', true);
	    }
	}
	window.onorientationchange = assessOrientation;
	window.onload = assessOrientation();
}

function openForm(){
	window.open("madlab/pdf/consent_"+client.type+".pdf", '_blank');
}

function submitConsent(){
	demographicClient.consent = $('input[name = "checkconsent"]').prop("checked");
	demographicClient.parentName = $('input[name = "parentName"]').val();
	demographicClient.childName = $('input[name = "childName"]').val();
	demographicClient.DOB = $('input[name = "DOB"]').val();
}

function submitDemo(){
	demographicClient.country = $('select[name = "country"] option:selected').val();
	demographicClient.gender = $('input[name = "gender"]:checked').val();
	demographicClient.firstLang = $('input[name = "firstLanguage"]:checked').val();
	demographicClient.English = $('input[name = "English"]:checked').val();
	demographicClient.hearing = $('input[name = "hearing"]:checked').val();
	demographicClient.hearingExplain = $('input[name = "hearingExplain"]').val();
	demographicClient.vision = $('input[name = "vision"]:checked').val();
	demographicClient.visionExplain = $('input[name = "visionExplain"]').val();
	demographicClient.videoaudio = $('input[name = "videoaudio"]:checked').val();
	demographicClient.audioonly = $('input[name = "audioonly"]:checked').val();
	demographicClient.stillimages = $('input[name = "stillimages"]:checked').val();
	demographicClient.imageAllowed = demographicClient.videoaudio || demographicClient.stillimages;
	demographicClient.futureEmail = $('input[name = "futureEmail"]').val();
	demographicClient.futurePhone = $('input[name = "futurePhone"]').val();
	demographicClient.otherName = $('input[name = "otherName"]').val();
	demographicClient.otherDOB = $('input[name = "otherDOB"]').val();
}

function submitContact(){
	demographicClient.contactEmail = $('input[name = "email"]').val();
	demographicClient.comments = $('input[name = "comments"]').val();
}