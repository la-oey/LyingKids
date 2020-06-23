var clicksMap = {
	"presetup": function(){},
	"setup": clickPreSetup,
	"consent": clickSetup,
	"demographic": clickConsent,
	"start": clickDemo,
	"photobooth": clickStart,
	"introduction": clickPicture,
	"pickColor": clickIntro,
	"instructions": clickColor,
	"trialDrawer": clickInstruct,
	"trialReport": report,
	"trialResponder": function(){trial.liarPlayer = expt.compColor; restartTrial(); detector();}
}