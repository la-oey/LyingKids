<?php
	header('Access-Control-Allow-Origin: *'); 
	header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); 
	header('Access-Control-Allow-Methods: Content-Type'); 
	// ob_start();
	// 	error_reporting(E_ALL);
	// 	ini_set('display_errors', '1');
	$experimenter = $_POST['experimenter'];
	$experimentName = $_POST['experimentName'];
	$img = $_POST['img'];
	$img = str_replace('data:image/png;base64,', '', $img);
	$img = str_replace(' ', '+', $img);
	$data = base64_decode($img);

	// change permissions if you accidentally assigned the wrong permissions
	// chmod(sprintf('data/%s/%s/img/', $experimenter, $experimentName), 0777);

	$dataDir = "data/" . $experimenter . "/" . $experimentName . "/img/" . $_POST['name'] . "/";
	//$dataDir = sprintf('data/%s/%s/img/%s/', $experimenter, $experimentName, $_POST['name']);
	if (!file_exists($dataDir)) {
		// 0755 (directory, permissions mode, recursive = true for creating full path)) 
		if (!mkdir($dataDir, 0777, true)) {	// 0644, 0750, 0755 //0777 for full permissions						
			print_r($_SERVER);
			die("Failed to create directory!\n$dataDir");
		}
		chmod($dataDir, 0777);
		chmod("data/" . $experimenter . "/" . $experimentName . "/img", 0777);
		chmod("data/" . $experimenter . "/" . $experimentName, 0777);
		chmod("data/" . $experimenter , 0777);
	} else {
		// print_r("Writing to $dataDir\n");
	}

	$i = 0;
	while(file_exists($upload_name = $dataDir. $_POST['name'] . '_img' . $i . '.png')) {
		$i++;
	}

	if(file_put_contents($upload_name, $data)) {
		// print_r("Success saving data!\n");
		// print_r("fileName: $fileName \n");
	} else{
		// print_r("Error...could not save data!\n");
		// print_r("fileName: $fileName \n");
	}

?>
