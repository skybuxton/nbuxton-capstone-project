var prefillTextArea = function(correctionType) {
	var text = "";
	if(correctionType == "No Correction") {
		text = "HARLAN, Ky. — I have lived in the Appalachian coal fields for 30 years, working as a writer and an educator, and I have often been asked to “explain” my region. Appalachia is a huge, diverse part of the country, including some or all of 13 states and 25 million people, but around me there is high unemployment, poverty and dependence on government subsidies. People ask me how an overwhelming majority of people in a community such as mine could vote for Donald Trump.\n\nIt is a tough question. Appalachia has been going through rapid, often painful changes for the past hundred years, and our communities have been working hard to rebuild our economies. Over the past decade, many of us have put aside partisan politics to work together to do what’s best for the places we live in, the places we love. But the 2016 election has strained the bonds we’ve forged — and has led to deep reflection and conversation within the region.";
	} else if(correctionType == "Minor Correction") {
		text = "Justice Ruth Bader Ginsburg, writing for the majority, added that nothing in the Clean Air Act requires the EPA to give the extra guidance or time that Texas had insisted was necessary to follow the rules.\n\nEPA is not obliged to postpone its action even a single day, she wrote.\n\nEnvironmental groups hailed the ruling as a victory for clean air, noting that the EPA estimates the Cross-State Air Pollution Rule would save 30,000 lives a year. But Texas and other states that challenged it, including Louisiana and Alabama, said it would devastate their economies. Justice Anthony Kennedy, the Supreme Courtâ€™s swing vote on many issues, and Chief Justice John Roberts, one of the courtâ€™s most conservative justices, joined the courtâ€™s four more liberal justices in ruling in favor of the EPA.\n\nAbbott has sued the EPA multiple times. A federal court dismissed a lawsuit last year that challenged the agency for taking over Texasâ€™ greenhouse gas permitting program. The state lost another lawsuit protesting the EPAâ€™s definition of greenhouse gases as a danger to public health and welfare, and the Supreme Court declined to hear an appeal.\n\nThe fate of another challenge by Texas and industry groups to EPA regulations will soon be decided. The Supreme Court heard arguments in February against the agencyâ€™s greenhouse gas permitting rules and will issue a ruling in the coming months.\n\nDisclosure: The University of Texas at Austin is a corporate sponsor of The Texas Tribune.Â A complete list of Texas Tribune donors and sponsors can be viewedÂ here.\n\n*Editor\'s note: An earlier version of this story incorrectly referred to the United Mine Workers of America as an industry group.";
	} else if(correctionType == "Major Correction") {
		text = "";
	} else if(correctionType == "Breaking News Update") {
		text = "";
	}
	$('#inputTextarea').val(text);
}

var runModel = function(text) {
	$.ajax({
	  type: "POST",
	  url: '/run_model.json',
	  data: {"text": text},
	  success: function(data) {
	  	displayResults(data);
	  },
	  dataType: 'json'
	});
};

var runModelFromModal = function() {
	var text = $('#inputTextarea').val();
	if(text == "" || text == null) {
		alert("Please put in some text");
		return;
	} else if(text.length < 100) {
		alert("Please paste in some more text, too short");
		return;
	}
	runModel(text);
};

var displayResults = function(result) {
	$('#resultName').html(result["category"]);
	$('#resultAccuracy').html(result['accuracy']);
	$('#inputTextarea').val("");

	$('#resultModal').modal('show');
	$('#inputModal').modal('hide');
}
