var clicksMap = {
	"presetup": function(){$('#presetup').css('display','block')},
	"setup": clickPreSetup,
	"consent": clickSetup,
	"demographic": function(){
		$('#demographic').css('display','block');
	},
	"start": clickDemo,
	"photobooth": function(){
		demographicClient.videotaping = "yes";
		clickStart();
	},
	"introduction": clickPicture,
	"pickColor": clickIntro,
	"practiceDrawer": clickColor,
	"practiceResponder": function(){
		$('#practiceViddiv').css('display','block');
		trial.exptPart = "practice";
		trial.liarPlayer = expt.compColor;
		trial.trialNumber = 1;
        restartTrial();
        detector();
        $('.replayButton').css('display','none');
	},
	"trial": clickPostPractice,
	"confirmation": clickWinner,
	"debriefing": confirmEmail
}