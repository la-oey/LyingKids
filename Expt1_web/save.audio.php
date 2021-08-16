<?php
	header('Access-Control-Allow-Origin: *'); 
	header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); 
	header('Access-Control-Allow-Methods: Content-Type'); 
	
	$experimenter = $_POST['experimenter'];
	$experimentName = $_POST['experimentName'];
	
	$dataDir = "data/" . $experimenter . "/" . $experimentName . "/aud/";
	if (!file_exists($dataDir)) {
		// 0755 (directory, permissions mode, recursive = true for creating full path)) 
		if (!mkdir($dataDir, 0777, true)) {	// 0644, 0750, 0755	//0777 for full permissions						
			print_r($_SERVER);
			die("Failed to create directory!\n$dataDir");
		}
		chmod($dataDir, 0777);
		chmod("data/" . $experimenter . "/" . $experimentName, 0777);
		chmod("data/" . $experimenter, 0777);
	} else {
		// print_r("Writing to $dataDir\n");
	}

	//this will print out the received name, temp name, type, size, etc. 
	$input = $_FILES['audio_data']['tmp_name']; //get temporary name PHP gave to the uploaded file 
	$output = $dataDir.$_FILES['audio_data']['name'].".wav";
	//move the file from temp name to local folder using $output name 
	move_uploaded_file($input, $output)
?>
