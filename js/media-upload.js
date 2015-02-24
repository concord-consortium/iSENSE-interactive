function uploadImage(fileSelectId, server, datasetID, contributionKey, contributorName, onLoad) {
	// Make the URL links.
	var API_URL = server + '/api/v1/media_objects';

	var fileSelect = document.getElementById(fileSelectId);

	// Get the selected files from the input.
	var files = fileSelect.files;

	if (files.length == 0) {
		// no file was selected
		return false;
	}

    // Create a new FormData object.
    var formData = new FormData();

	// check the first file
	var file = files[0];

    // Check the file type.
    if (!file.type.match('image.*')) {
      alert("only supports image files");
      return false;
    }

	// Add the file to the request.
	formData.append('upload', file, file.name);
	formData.append('contribution_key', contributionKey);
	formData.append('contributor_name', contributorName);
	formData.append('type', 'data_set');
	formData.append('id', datasetID);

	// Post to iSENSE
	var xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL, true);
    // xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    // send the collected data as JSON
    xhr.send(formData);
    xhr.onload = function () {
      console.log("finished iSense post");
      if(onLoad) {
      	onLoad();
      }
    };

    return true;
}