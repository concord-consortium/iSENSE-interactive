var server = "http://isenseproject.org";
var projectNum = "843";
var groupFieldNumber = "4188";
var groupName = "";

window.onload = function () {
  document.getElementById("open-isense-project").href = server + "/projects/" + projectNum;
}

function projectLoaded() {
  var project = JSON.parse(this.responseText);
  console.log(project);
  // find all the datasets that start with group1
  var matchingDataSets = [];
  project.dataSets.forEach(function(dataSet){
    if(dataSet.data[0][groupFieldNumber] == groupName){
      matchingDataSets.push(dataSet);
    }
  });

  if(matchingDataSets.length == 0){
    document.getElementById("visualization-iframe-container").innerHTML = 
      "There is no data for this group.";
  	return;
  }

  var dataSetList = matchingDataSets.map(function(dataSet){
  	return dataSet.id;
  }).join(",");
  console.log("dataSetList:" + dataSetList);

  // inject an iframe with the following url
  // NOTE if there are no matching datasets then the iframe will show all of them
  var url = server + "/projects/" + projectNum + "/data_sets/" + dataSetList + "?embed=true";
  var openLink = document.getElementById("open-visualization-link");
  openLink.href = url;
  openLink.className = "";

  document.getElementById("visualization-iframe-container").innerHTML =
    "<iframe src='" + url + "' width='100%' height='500'>";
}

function updateGroupName() {
  document.getElementById("data-set-form").className = "";

  groupName = document.getElementById("group-name-field").value;
  var oReq = new XMLHttpRequest();
  oReq.onload = projectLoaded;
  oReq.open("get", server + "/api/v1/projects/" + projectNum + "?recur=true", true);
  oReq.send();
}

function createDataSet() {
	// Make the URL links.
	var API_URL = server + '/api/v1/projects/' + projectNum + '/jsonDataUpload';

	// Get current time - used for timestamp
	var currentTime = new Date();
	var timestamp = JSON.stringify(currentTime);

	// Get the variables that the user entered in the HTML portion of the app.
	// Data to be uploaded to iSENSE
	var upload = {
    'contribution_key' : "1234",
    'contributor_name' : groupName,
    'title': document.waterscience.datasetNameField.value + " " + [timestamp],
		'data':
	  	{
			'4186': [document.waterscience.phField.value],
			'4187': [document.waterscience.turbidityField.value],

	 	}
	}

	upload.data[groupFieldNumber] = [groupName];

	// Post to iSENSE
	var xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    // send the collected data as JSON
    xhr.send(JSON.stringify(upload));
    xhr.onloadend = function () {
      console.log("finished iSense post");
      updateGroupName();
    };
}
