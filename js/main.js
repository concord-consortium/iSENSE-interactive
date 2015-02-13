var server = "http://isenseproject.org";
var projectNum = "843";
var groupFieldNumber = "4188";
var phFieldNumber = "4186";
var turbidityFieldNumber = "4187";
var latitudeFieldNumber = "4189";
var longitudeFieldNumber = "4190";

var groupName = "";
var position = {};

window.onload = function () {
  document.getElementById("open-isense-project").href = server + "/projects/" + projectNum;
  getLocation();
}

function getLocation() {
  if (!navigator.geolocation){
    return;
  }

  function success(geoPosition) {
    position.latitude = geoPosition.coords.latitude;
    position.longitude = geoPosition.coords.longitude;
    document.getElementById("latitude").innerHTML = position.latitude;
    document.getElementById("longitude").innerHTML = position.longitude;

  };

  function error() {
    console.log("Unable to retrieve your location");
  };

  navigator.geolocation.getCurrentPosition(success, error);
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
  var data = {};
  data[groupFieldNumber] = [groupName];
  data[phFieldNumber] = [document.waterscience.phField.value];
  data[turbidityFieldNumber] = [document.waterscience.turbidityField.value];

  // add position data if it exists
  if (position.latitude && position.longitude){
    data[latitudeFieldNumber] = [position.latitude];
    data[longitudeFieldNumber] = [position.longitude];
  }

	var upload = {
    'contribution_key' : "1234",
    'contributor_name' : groupName,
    'title': document.waterscience.datasetNameField.value + " " + [timestamp],
		'data': data
	  };

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
