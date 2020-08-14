<?php
if( $_POST["key"] ){
	// echo "POST: " . $_POST["key"] . "<br>";
	if($_POST["date"]){
		$date = $_POST["date"];
	}
	else{
		$date = gmdate("D\, d F Y H:i:s") . ' GMT';
	}

	$valid = false;

	$myfile = fopen("../../secret/config.txt", "r") or die("Unable to open file!");
	// Output one line until end-of-file
	if(!feof($myfile)) {
		$keys = explode(",", fgets($myfile));
		foreach ($keys as $key => $value){
			if($value == $_POST["key"]){
				// echo "match found for: " . $value . "<br>";
				$valid = true;
				break;
			}
		}
	}
	fclose($myfile);

	if($valid){
		// Swift Mailer Library
		require_once './swiftmailer-5.x/lib/swift_required.php';

		// Mail Transport
		$transport = Swift_SmtpTransport::newInstance('ssl://smtp.gmail.com', 465)
		    ->setUsername('watersimserver@gmail.com') // Your Gmail Username
		    ->setPassword('dcDC2016'); // Your Gmail Password

		// Mailer
		$mailer = Swift_Mailer::newInstance($transport);
		$to = 'watersimserver@gmail.com';
		// $to = 'michaeltsteptoe@gmail.com';
		// $to = 'ray.quay@cox.net';

		// Create a message
		$message = Swift_Message::newInstance('WaterSim HTTP StatusCode: ' . $_POST["statusCode"])
		    ->setFrom(array('watersimserver@gmail.com' => 'WaterSim America Server')) // can be $_POST['email'] etc...
		    ->setTo(array($to => 'WaterSim Admin')) // your email / multiple supported.
		    ->setBody('<br>Smithsonian ID: ' . $_POST["smithValue"] . '<br>Serial #: ' . $_POST["SNValue"] .
		    	'<br>Details: ' . $_POST["details"] . '<br>StatusText: ' . $_POST["statusText"] . '<br>State: ' . $_POST["state"] .
		    	'<br>Function: ' . $_POST["where"] . '<br>Date: ' . $date .
		    	'<br>Sent From: america.quaytest.net', 'text/html');

		// Send the message
		if ($mailer->send($message)) {
		    echo json_encode(array("result" => "Mail sent successfully."));
		} else {
			echo json_encode(array("result" => "Mail failed to send."));
		}
	}
}




?>