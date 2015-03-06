var groupName = "";
var teacherName = "";
var position = {};
var groupFieldNumber;
var teacherFieldNumber;
var latitudeFieldNumber;
var longitudeFieldNumber;
var dataFields;

window.onload = function () {
  // load projectNum from URL
  if(location.hash){
    projectNum = location.hash.slice(1);
  } else {
    // default project number
    projectNum = "843";
  }

  document.getElementById("open-isense-project").href = server + "/projects/" + projectNum;
  getLocation();

  $('#data-set-form').submit(function (){
    createDataSet();
    $('#create-data-set-submit').focus();
    return false;
  });

  $('#group-name-form').submit(function (){
    updateGroupName();
    $('#update-group-submit').focus();
    return false;
  });
}

function getLocation() {
  if (!navigator.geolocation){
    return;
  }

  function success(geoPosition) {
    position.latitude = geoPosition.coords.latitude;
    position.longitude = geoPosition.coords.longitude;
    $('#latitude').html(position.latitude);
    $('#longitude').html(position.longitude);
  };

  function error() {
    console.log("Unable to retrieve your location");
  };

  navigator.geolocation.getCurrentPosition(success, error);
}

function projectLoaded() {
  var project = JSON.parse(this.responseText);
  console.log(project);

  dataFields = [];
  project.fields.forEach(function(field){
    if(field.name == "Group Name"){
      groupFieldNumber = field.id;
      return;
    }
    if(field.name == "Teacher Name"){
      teacherFieldNumber = field.id;
      return;
    }
    if(field.name == "Latitude"){
      latitudeFieldNumber = field.id;
      return;
    }
    if(field.name == "Longitude"){
      longitudeFieldNumber = field.id;
      return;
    }
    dataFields.push(field);
  });

  var dataFieldsDiv = $("#data-fields");
  dataFieldsDiv.html("");
  dataFields.forEach(function(field){
    dataFieldsDiv.append("<label>" + field.name +
      " <input type='text' data-isense-field='" + field.id + "'/></label>\n");
  });

  // find all the datasets that start with group1
  var matchingDataSets = [];
  project.dataSets.forEach(function(dataSet){
    var dataPoint = dataSet.data[0];
    if(dataPoint[groupFieldNumber] == groupName && dataPoint[teacherFieldNumber] == teacherName){
      matchingDataSets.push(dataSet);
    }
  });

  if(matchingDataSets.length == 0){
    $('#visualization-iframe-container').html("There is no data for this group.");
  	return;
  }

  var dataSetList = matchingDataSets.map(function(dataSet){
  	return dataSet.id;
  }).join(",");
  console.log("dataSetList:" + dataSetList);

  // inject an iframe with the following url
  // NOTE if there are no matching datasets then the iframe will show all of them
  var url = server + "/projects/" + projectNum + "/data_sets/" + dataSetList + "?embed=true";

  $('#visualization-iframe-container').html(
    "<iframe src='" + url + "' width='100%' height='550'>"
  );
}

function updateGroupName() {
  $('#data-set-form-div').removeClass();

  groupName = $('#group-name-field').val();
  teacherName = $('#teacher-name-field').val();
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
  data[teacherFieldNumber] = [teacherName];

  // need to iterate through all of the input fields
  $('#data-set-form').find('input[data-isense-field]').each(function (){
    data[$(this).data('isenseField')] = [this.value];
  });

  // add position data if it exists
  if (position.latitude && position.longitude){
    data[latitudeFieldNumber] = [position.latitude];
    data[longitudeFieldNumber] = [position.longitude];
  }

	var upload = {
    'contribution_key' : contributionKey,
    'contributor_name' : groupName,
    'title': document.dataSetForm.datasetNameField.value + " " + [timestamp],
		'data': data
	  };

	// Post to iSENSE
	var xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    // send the collected data as JSON
    xhr.send(JSON.stringify(upload));
    xhr.onload = function () {
      var datasetResult = JSON.parse(this.responseText);
      console.log("finished iSense post");
      console.log(datasetResult);

      // need to pull out the dataset id so we can possibly post the attached image
      if(!uploadImage('file-select', server, datasetResult.id, contributionKey, groupName,
          function(){
            updateGroupName();
          })){

        // this refreshes the visualization below, it only happens if there wasn't an image to upload
        updateGroupName();
      }
    };
}

function doFileSelectClick() {
  $('#file-select').click();
}

function handleFiles(files) {
  var d = document.getElementById("attached-image");
  if (!files.length) {
    d.innerHTML = "<p>No files selected!</p>";
  } else {
    for (var i=0; i < files.length; i++) {
      var img = document.createElement("img");
      img.src = window.URL.createObjectURL(files[i]);;
      img.height = 60;
      img.onload = function() {
        window.URL.revokeObjectURL(this.src);
      }
      d.appendChild(img);
    }
    $('#attach-image-link').hide();
  }
}

