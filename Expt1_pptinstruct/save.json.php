<?php

function ajax_error($code, $message){
	header('content-type: application/json; charset=utf-8');
	header("access-control-allow-origin: *");
	$output = array('Success' => false,
			   		'Error' => $code,
			   		'Message' => $message);
	echo json_encode($output);
	die();
}


function ajax_return($contents){
	header('content-type: application/json; charset=utf-8');
	header("access-control-allow-origin: *");
	$output = array('Success' => true,
			   		'Data' => $contents);
	echo json_encode($output);
	die();
}

	$experimenter = $_POST['experimenter'];
	$experimentName = $_POST['experimentName'];
	$data = json_decode($_REQUEST['data'], true);

	// setup directories (w/ permissions)
	$dataDir = "data/" . $experimenter . "/" . $experimentName . "/dat/";
	// $dataDir = sprintf('data/%s/%s/dat/', $experimenter, $experimentName);

	// change permissions if you accidentally assigned the wrong permissions
	// chmod(sprintf('data/%s/%s/dat/', $experimenter, $experimentName), 0777);

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

	$rawfile = $dataDir . $data['client']['sid'] . '.json';
	$fp = fopen($rawfile, 'w');
	fwrite($fp, json_encode($data, JSON_PRETTY_PRINT));
	fclose($fp);

	ajax_return('success');