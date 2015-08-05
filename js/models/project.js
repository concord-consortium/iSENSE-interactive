// Projects can either be filled out with their iSENSE data
// or they can just contain a name and id
var Project = function(data){
  this.id = data.id;
  this.name = data.name;
  this.server = "http://isenseproject.org";
  this.isenseProjectLink = this.server + "/projects/" + this.id;
  this.dataFields = [];
  this.loading = false;
};

// Load this project from iSENSE
Project.prototype.load = function (callback){
  var oReq = new XMLHttpRequest(),
      self = this;

  this.loading = true;

  oReq.onload = function () {
    self.isenseProject = JSON.parse(this.responseText);
    self.parseFields();
    self.loading = false;
    if (typeof callback !== 'undefined'){
      callback();
    }
  };
  oReq.open("get", this.server + "/api/v1/projects/" + this.id + "?recur=true", true);
  oReq.send();
};

Project.prototype.parseFields = function(){
  var project = this.isenseProject,
      ids;
  this.dataFields = [];
  this.fieldIDs = {};
  ids = this.fieldIDs;

  project.fields.forEach(function(field){
  	switch(field.name){
  		case "Team Name":
  		  ids.teamName = field.id;
  		  break;
  		case "Class Name":
  		  ids.className = field.id;
  		  break;
  		case "Teacher Name":
  		  ids.teacherName = field.id;
  		  break;
  		case "State":
  		  ids.state = field.id;
  		  break;
  		case "Latitude":
  		  ids.latitude = field.id;
  		  break;
  		case "Longitude":
  		  ids.longitude = field.id;
  		  break;
  		default:
  		  this.dataFields.push(field);
  	}
  }.bind(this));
};

Project.prototype.uploadData = function(uploadInfo) {
 // uploadData({
 //      contributionKey : this.state.classPeriod.isenseLabel(),
 //      contributorName : this.state.team.name,
 //      data            : dataSet
 	// Make the URL links.
	var API_URL = this.server + '/api/v1/projects/' + this.id + '/jsonDataUpload';

	// Get current time - used for timestamp
	var currentTime = new Date();
	var timestamp = JSON.stringify(currentTime);

	var upload = {
      'contribution_key' : uploadInfo.contributionKey,
      'contributor_name' : uploadInfo.contributorName,
      'title':  "" + [timestamp],
	  'data': uploadInfo.data
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
      // var uploadingImage =
      //   uploadImage('file-select', server, datasetResult.id, contributionKey, combinedTeamName(),
      //               function(){
      //                  updateVisualization();
      //               })

      // if(!uploadingImage){
      //   updateVisualization();
      // }
      // need to fire the callback to update the state
    };

};
