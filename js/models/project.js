// Projects can either be filled out with their iSENSE data
// or they can just contain a name and id
var Project = function(data){
  // these are all serialized
  this.id = data.id;
  this.name = data.name;
  // hack to cause connection error
  this.server = "http://isenseproject.org";
  this.isenseProject = ('isenseProject' in data) ? data.isenseProject : null;

  // this could be serialized but it is not required
  this.dataFields = ('dataFields' in data) ? data.dataFields : [];

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

    // what we really want to do here is send a generic event (to the dispatcher)
    // so the views that care about this particular project can update if necessary
    // alternatively these views could add listeners to this model and then
    // update the state when this project is loaded
    if (typeof callback !== 'undefined'){
      callback();
    }
  };

  oReq.onerror = function () {
    self.loading = false;
  }

  // we should only pass the recur param if we need all of the datasets
  // the mobile app doesn't need all of the datasets
  // oReq.open("get", this.server + "/api/v1/projects/" + this.id + "?recur=true", true);

  // offline hack
  oReq.open("get", this.server + "/api/v1/projects/" + this.id, true);
  oReq.send();
};

Project.prototype.isenseProjectLink = function(){
  return this.server + "/projects/" + this.id;
}

Project.prototype.parseFields = function(){
  var project = this.isenseProject,
      ids;

  if(this.isenseProject === null){
    return;
  }

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

Project.prototype.uploadData = function(uploadInfo, callback) {
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

	  if (typeof callback !== 'undefined'){
	    callback(datasetResult);
	  }
    };

};

Project.prototype.serialize = function(manager) {
  return {
    id: this.id,
    server: this.server,
    name: this.name,
    isenseProject: this.isenseProject
  }
}

Project.deserialize = function(manager, data) {
  var project = new Project(data);
  project.parseFields();
  return project;
}

module.exports = Project;