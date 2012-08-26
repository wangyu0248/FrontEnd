<?php

	#####################################################################################
	#
	# Functions for combining payloads into a single stream that the
	# JS will unpack on the client-side, to reduce the number of HTTP requests.
	#
	#####################################################################################

	#
	# Takes an array of payloads and combines them into a single stream, which is then
	# sent to the browser.
	#
	# Each item in the input array should contain the following keys:
	#
	# data         - the image or text data. image data should be base64 encoded.
	# content_type - the mime type of the data
	#
	
	function mxhr_stream($payloads) {
		
		$stream = array();
		
		$version = 1;
		$sep = chr(1); # control-char SOH/ASCII 1
		$newline = chr(3); # control-char ETX/ASCII 3
		
		foreach ($payloads as $payload) {
			$stream[] = $payload['content_type'] . $sep . (isset($payload['id']) ? $payload['id'] : '') . $sep . $payload['data'];
		}

		echo $version . $newline . implode($newline, $stream) . $newline;
	}
	
	#
	# Package image data into a payload
	#
	
	function mxhr_assemble_image_payload($image_data, $id=null, $mime='image/jpeg') {
		return array(
			'data' => base64_encode($image_data),
			'content_type' => $mime,
			'id' => $id
		);
	}
	
	#
	# Package html text into a payload
	#

	function mxhr_assemble_html_payload($html_data, $id=null) {
		return array(
			'data' => $html_data,
			'content_type' => 'text/html',
			'id' => $id
		);
 	}

	#
	# Package javascript text into a payload
	#

	function mxhr_assemble_javascript_payload($js_data, $id=null) {
		return array(
			'data' => $js_data,
			'content_type' => 'text/javascript',
			'id' => $id
		);
 	}

	#####################################################################################

	#
	# Send the multipart stream
	#

	if ($_GET['send_stream']) {

		$repetitions = 300;
		$payloads = array();

		#
		# JS files
		#

		$js_data = 'var a = "JS execution worked"; console.log(a, ';

		for ($n = 0; $n < $repetitions; $n++) {
#			$payloads[] = mxhr_assemble_javascript_payload($js_data . $n . ', $n);');
		}

		#
		# HTML files
		#

		$html_data = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"><html><head><title>Sample HTML Page</title></head><body></body></html>';

		for ($n = 0; $n < $repetitions; $n++) {
#			$payloads[] = mxhr_assemble_html_payload($html_data, $n);
		}

		#
		# Images
		#

		$image = 'icon_check.png';
		$image_fh = fopen($image, 'r');
		$image_data = fread($image_fh, filesize($image));
		fclose($image_fh);

		for ($n = 0; $n < $repetitions; $n++) {
			$payloads[] = mxhr_assemble_image_payload($image_data, $n, 'image/png');
		}

		#
		# Send off the multipart stream
		#
		mxhr_stream($payloads);
		exit;
	}

?>
