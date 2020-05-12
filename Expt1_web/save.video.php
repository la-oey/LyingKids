<?php
if(isset($_FILES['file']) and !$_FILES['file']['error']){
	//names video file by client id
	$upload_name = sprintf('%s/%s.webm', 'output/video-recording', $_REQUEST['name']);
    move_uploaded_file($_FILES['file']['tmp_name'], $upload_name);
}
?>