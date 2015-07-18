var teamName = "";
var className = "";
var teacherName = "";
var usState = "";
var position = {};
var teamFieldNumber;
var teacherFieldNumber;
var stateFieldNumber;
var latitudeFieldNumber;
var longitudeFieldNumber;
var dataFields;
var projectList;
var contributorInfo = {};
var project;

window.onload = function () {
  // load projectNum from URL
  if(location.hash){
    projectNum = location.hash.slice(1);
  } else {
    // default project number
    projectNum = "1186";
  }

  document.getElementById("open-isense-project").href = server + "/projects/" + projectNum;
  getLocation();

  $('#classword-form').submit(function (){
    // send classword to portal and get class info in response
    // need to handle unknown classword, also should handle the case where the classword
    // matched but was for the wrong class
    getClassInfo($('#classword-field').val());
    $('#classword-submit').focus();
    return false;
  });

  $('#data-set-form').submit(function (){

    var data_set_info =
      '<h2>Data Collection</h2><p>' +
      // TODO see if we can add the rest of the values here
      'Latitude: <span class="value">' + $('#latitude').text() + '</span>, ' +
      'Longitude: <span class="value">' + $('#longitude').text() + '</span>, ' +
      'more...</p><a class="edit-link" href="#" onclick="showDataSetForm(); return false;">add a point</a>';
    $('#data-set-form').fadeOut();
    $('#data-set-info').html(data_set_info).fadeIn();

    createDataSet();
    $('#create-data-set-submit').focus();
    return false;
  });

  $('#team-name-form').submit(function (){

    var team_name_info =
      '<h2>Team: ' + $('#team-name-field').val() + '</h2>' +
      '<a class="edit-link" href="#" onclick="showTeamNameForm(); return false;">edit</a>';
    $('#team-name-form').fadeOut();
    $('#team-name-info').html(team_name_info).fadeIn();

    updateTeamName();
    $('#update-team-submit').focus();
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
  console.log(project);

  $('#project-info').fadeIn();
  $('#project-name').html(project.name);

  dataFields = [];
  project.fields.forEach(function(field){
    if(field.name == "Team Name"){
      teamFieldNumber = field.id;
      return;
    }
    if(field.name == "Class Name"){
      classFieldNumber = field.id;
      return;
    }
    if(field.name == "Teacher Name"){
      teacherFieldNumber = field.id;
      return;
    }
    if(field.name == "State"){
      stateFieldNumber = field.id;
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
    var unitString = "";
    if(field.unit) {
      unitString = " (" + field.unit + ")";
    }
    // TODO add support for contratined text fields so they show a select box
    dataFieldsDiv.append('<dt><label for="' + field.id + '">' + field.name + unitString +
      '</label></dt><dd><input type="text" data-isense-field="' + field.id + '"/></dd>' + "\n");
  });

}


function showVisualization() {
  // find all the datasets for this team
  // TODO the saved team name should actually include the className so a teacher can compare
  // across periods even if the team names are the same
  var matchingDataSets = [];
  project.dataSets.forEach(function(dataSet){
    var dataPoint = dataSet.data[0];
    if(dataPoint[teamFieldNumber] == combinedTeamName() &&
       dataPoint[classFieldNumber] == className &&
       dataPoint[teacherFieldNumber] == teacherName &&
       dataPoint[stateFieldNumber] == usState){
      matchingDataSets.push(dataSet);
    }
  });

  if(matchingDataSets.length == 0){
    $('#visualization-iframe-container').html("There is no data for this team.");
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
    "<iframe id='visualization' src='" + url + "' width='100%' height='550' allowfullscreen='true'></iframe><div id='fullsize-link' title='Toggle full-screen' onclick='requestFullScreen(\"visualization\");'></div>"
  );
}

function shortenString(string, targetLength) {
  if(string.length > targetLength) {
    string = string.substring(0,targetLength-1);
  }
  return string;
}

function computeContributorInfo(state, teacherLastName, className, key) {
  // need to shorten the key it can only be 40 chars
  // strip off http[s]://
  // strip 'concord.org'
  key = key.replace('.concord.org', '');
  key = key.replace('http://', '');
  key = key.replace('https://', '');
  contributorInfo.key = key;


  // this label can only be 40 characters so:
  // 2 separators between state and teacher and teacher and class
  // 2 State
  // 18 teacher
  // 18 class example "Science 101 Period 1" will be turned into "Science 101 Period"
  if ((teacherLastName.length + className.length) > 36) {
    if(teacherLastName.length > 18 && className.length > 18) {
      // they are both long shorten them both to 18
      teacherLastName = shortenString(teacherLastName, 18);
      className = shortenString(className, 18);
    } else {
      if (teacherLastName.length > className.length) {
        teacherLastName = shortenString(teacherLastName, 36-className.length);
      } else {
        className = shortenString(className, 36-teacherLastName.length);
      }
    }
    // need to shorten one or both of the strings not sure the best approach here
  }
  contributorInfo.label = state + '-' + teacherLastName + '-' + className;
  contributorInfo.label = contributorInfo.label.toLowerCase();
  return contributorInfo;
}

function getClassInfo(classword) {
  // Request info from portal
  var xhr = new XMLHttpRequest();
  xhr.open('GET', "resources/mock-class-info.json?classword=" + encodeURIComponent(classword), true);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

  xhr.onload = function () {
    var classInfo = JSON.parse(this.responseText);


    console.log("finished classinfo request");
    console.log(classInfo);

    // set globals
    teacherName = classInfo.teachers[0].last_name;
    className = classInfo.name;
    usState = classInfo.state;

    var classInfoHtml =
      '<h2>Class: ' + className + '</h2><p>' +
      'Teacher: <span class="value">' + teacherName + '</span>, ' +
      'State: <span class="value">' + usState + '</span>' +
      '</p><a class="edit-link" href="#" onclick="showClasswordForm(); return false;">change</a>';


    $('#classword-form').fadeOut();
    $('#class-info').html(classInfoHtml).fadeIn();

    // need to compute contributor key label
    var contributorInfo =
      computeContributorInfo(usState, teacherName, className, classInfo.uri);
    console.log(contributorInfo);

    // submit contributor info to our contributor key creator
    // this site creates the key for every registered project
    addContributorKeyToISense();
  };

  xhr.onerror = function () {
    console.log("error loading classinfo");
  };

  // send the collected data as JSON
  xhr.send();
}

function addContributorKeyToISense(contributorInfo) {
  // this should POST the contributor info object to our contributor key creator
  // this contributor key creator will return the list of registered projects
  // the app would then display and store this list of projects
  // the interactive can skip this step and just ask for the team name
  var xhr = new XMLHttpRequest();
  projectList = [];

  // this should be POST instead of GET when actually sending the data
  xhr.open('GET', "resources/mock-project-list.json", true);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

  // send the collected data as JSON
  // we should send data here when the contributor key creator site is up
  // xhr.send(JSON.stringify(contributorInfo));
  xhr.send();

  xhr.onload = function() {
    projectList = JSON.parse(this.responseText);
    console.log(projectList);
    showProjectList();
  };

  xhr.onerror = function() {

  }
}


function updateTeamName() {
  $('#data-set-form-div').removeClass();

  teamName = $('#team-name-field').val();

  // need to filter the data from the loaded project and show the results here
  // need to reload the project again
  showVisualization();
}

function loadISENSEProject(callback) {
  var oReq = new XMLHttpRequest();
  oReq.onload = function () {
    project = JSON.parse(this.responseText);
    projectLoaded();
    if (typeof callback !== 'undefined'){
      callback();
    }
  };
  oReq.open("get", server + "/api/v1/projects/" + projectNum + "?recur=true", true);
  oReq.send();
}

function updateVisualization() {
  loadISENSEProject(showVisualization);
}

function combinedTeamName() {
  return teamName + " - " + className;
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
  // store the team name as teamName - className to make filtering easier for teachers
  data[teamFieldNumber] = [combinedTeamName()];
  data[classFieldNumber] = [className];
  data[teacherFieldNumber] = [teacherName];
  data[stateFieldNumber] = [usState];

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
    'contribution_key' : contributorInfo.key,
    'contributor_name' : combinedTeamName(),
    'title':  combinedTeamName() + " " + [timestamp],
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
      var uploadingImage =
        uploadImage('file-select', server, datasetResult.id, contributionKey, combinedTeamName(),
                    function(){
                       updateVisualization();
                    })

      if(!uploadingImage){
        updateVisualization();
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

function showClasswordForm() {
  $('#classword-form').fadeIn('slow');
  $('#class-info').fadeOut('slow');
}

function showProjectList() {
  var project;

  $('#project-list').html('');
  $('#project-list-div').removeClass();
  for (var i=0; i < projectList.length; i++) {
    project = projectList[i];
    $('#project-list').append('<li><a href="#" onclick="useProject(' + project.id + '); return false;">' + project.name + '</a></li>');
  }
}

function useProject(id) {
  projectNum = '' + id;
  loadISENSEProject();
  $('#project-list-div').fadeOut();
  showTeamNameForm();
}

function showTeamNameForm() {
  $('#team-name-form-div').removeClass();
  $('#team-name-form').fadeIn('slow');
  $('#team-name-info').fadeOut('slow');
}

function showDataSetForm() {
  $('#data-set-form').fadeIn('slow');
  $('#data-set-info').fadeOut('slow');
}

function requestFullScreen(item_id) {

  var el = document.getElementById(item_id);

  // Supports most browsers and their versions.
  var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen 
  || el.mozRequestFullScreen || el.msRequestFullScreen;

  if (requestMethod) {
    // Native full screen.
    requestMethod.call(el);
  } else if (typeof window.ActiveXObject !== "undefined") {
    // Older IE.
    var wscript = new ActiveXObject("WScript.Shell");
    if (wscript !== null) {
      wscript.SendKeys("{F11}");
    }
  }
}
