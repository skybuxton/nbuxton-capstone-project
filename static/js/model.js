var runModel = function(text) {
	return {
		"category": "Minor Correction",
		"accuracy": "84.2%"
	}
};

var runModelFromModal = function() {
	var text = $('#inputTextarea').val();
	if(text == "" || text == null) {
		alert("Please put in some text");
		return;
	} else if(text.length < 500) {
		alert("Please paste in some more text, too short");
		return;
	}
	var result = runModel(text);
	$('#resultName').html(result["category"]);
	$('#resultAccuracy').html(result['accuracy']);
	$('#inputTextarea').val("");

	$('#resultModal').modal('show');
	$('#inputModal').modal('hide');
};


