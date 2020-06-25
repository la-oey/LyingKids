var clicksMap = {
	"presetup": function(){$('#presetup').css('display','block')},
	"setup": clickPreSetup,
	"consent": clickSetup,
	"demographic": clickConsent,
	"start": clickDemo,
	"photobooth": clickStart,
	"introduction": clickPicture,
	"pickColor": clickIntro,
	"instructions": clickColor,
	"practiceDrawer": clickInstruct,
	"practiceResponder": function(){
		$('#practiceViddiv').css('display','block');
		trial.exptPart = "practice";
		trial.liarPlayer = expt.compColor;
        restartTrial();
        detector();
        $('.replayButton').css('display','none');
	},
	"trial": clickPostPractice
}