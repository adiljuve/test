<?php

require_once 'vendor/mobile-detect/Mobile_Detect.php';

$detect = new Mobile_Detect;

// Any mobile device (phones or tablets).
if ($detect->isMobile()) {
	echo file_get_contents('mobile.html');
} else {
	echo file_get_contents('index.html');
	//echo file_get_contents('desktop.html');
}