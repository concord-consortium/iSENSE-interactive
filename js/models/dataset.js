var StorageManager = require("./storage-manager");
var uuid = require('node-uuid');

var MEDIA_API_URL = "https://isenseproject.org/api/v1/media_objects/";

var Dataset = function(project, classPeriod, team, data, photo){
  this.project = project;
  this.classPeriod = classPeriod;
  this.team = team;
  this.latitude = null;
  this.longitude = null;
  this.data = data;
  // could be created, uploading, uploaded, failed
  this.status = "created";
  this.photo = photo;
  // if there is no photo we mark the status as uploaded to simplify
  // logic later that is looking to see if the photo needs to be uploaded
  this.photoStatus = (photo === null) ? "uploaded" : "created";
  // this is the id of the dataset stored in isense
  this.isenseID = "";
  // need to give this dataset a unique URI
  this.uri = uuid.v1();
};

Dataset.prototype._getLocation = function(callback) {
  var self = this;

  if (!navigator.geolocation){
    callback();
    return;
  }

  function success(geoPosition) {
    self.latitude = geoPosition.coords.latitude;
    self.longitude = geoPosition.coords.longitude;
    callback();
  };

  function error() {
    console.log("Unable to retrieve your location");
    callback();
  };

  navigator.geolocation.getCurrentPosition(success, error);
}

Dataset.prototype._uploadPhoto = function(callback) {
  var self = this;
  // this assumes the isenseID for this dataset is set
  if(this.photo === null){
    return;
  }

  if(typeof this.photo === 'string' || this.photo instanceof String){
    // this should be a File URI from cordova's camera plugin
    this.photoStatus = "uploading";

    window.resolveLocalFileSystemURL(this.photo, function(fileEntry) {
      try {
        var options = new FileUploadOptions();
        options.fileKey = "upload";
        options.chunkedMode = false;
        options.fileName = this.photo.substr(this.photo.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.params = {
          "contribution_key": this.classPeriod.contributorKey(),
          "contributor_name": this.team.name,
          "type": "data_set",
          "id": "" + this.isenseID
        }
        var transfer = new FileTransfer();
        transfer.upload(fileEntry.toInternalURL(), encodeURI(MEDIA_API_URL),
                        function(r) {
                          console.log('Image uploaded');
                          self.photoStatus = 'uploaded';
                          callback(false);
                        },
                        function(error) {
                          console.log("Upload Fail -> " + error.code + " " + error.source);
                          self.photoStatus = 'failed';
                          callback(error);
                        },
                        options);
      } catch(err) {
        console.log("Failed Image upload: " + err.message);
        self.photoStatus = 'failed';
        callback(err);
      }
    }.bind(this), function(err) {
      self.photoStatus = 'failed';
      console.log("Failed to resolve image url: " + err.message);
      callback(err);
    });
  } else if (this.photo instanceof File) {
    // Create a new FormData object.
    var formData = new FormData();

    // Add the file to the request.
    formData.append('upload', this.photo, this.photo.name);
    formData.append('contribution_key', this.classPeriod.contributorKey());
    formData.append('contributor_name', this.team.name);
    formData.append('type', 'data_set');
    formData.append('id', this.isenseID);

    // Post to iSENSE
    var xhr = new XMLHttpRequest();
    xhr.open('POST', MEDIA_API_URL, true);
    xhr.send(formData);
    xhr.onload = function () {
      console.log('Image uploaded');
      self.photoStatus = 'uploaded';
      callback(false);
    };
    xhr.onerror = function (err) {
      console.log("Upload Fail -> " + err);
      self.photoStatus = 'failed';
      callback(err);
    };
  }
};

Dataset.prototype._upload = function(callback) {
  // data contains the data for the fields defined in the project
  // this requires the contributor key to have been created in iSENSE first
  // Get the variables that the user entered in the HTML portion of the app.
  // Data to be uploaded to iSENSE
  var dataSet = {},
      fieldIDs = this.project.fieldIDs;

  // TODO store the team name as teamName - className to make filtering easier for teachers
  dataSet[fieldIDs.teamName] = [this.team.name];
  dataSet[fieldIDs.className] = [this.classPeriod.name];
  dataSet[fieldIDs.teacherName] = [this.classPeriod.teacherName];
  dataSet[fieldIDs.state] = [this.classPeriod.state];

  // add position data if it exists
  if (this.latitude !== null && this.longitude !== null &&
      this.project.hasLocation()){
    dataSet[fieldIDs.latitude] = [this.latitude];
    dataSet[fieldIDs.longitude] = [this.longitude];
  }

  // add all input field values to the data set
  for (var key in this.data) {
    if (this.data.hasOwnProperty(key)) {
      dataSet[key] = [this.data[key]]
    }
  }

  this.project.uploadData({
    contributionKey : this.classPeriod.contributorKey(),
    contributorName : this.team.name,
    data            : dataSet
  }, function (isenseResult){
    this.isenseID = isenseResult.id;
    this.status = "uploaded";

    // save the dataset again after changing the status and getting the isenseID
    this.save();

    // if there is an image
    // we need to upload it here
    if(this.photo == null){
      callback(this, isenseResult);
    } else {
      this._uploadPhoto(function(error){
        // FIXME this is currently ignoring any errors while upload the image
        callback(this, isenseResult);
      }.bind(this));
    }
  }.bind(this));

  this.status = "uploading";

  // need to change some state to indicate that we are uploading
  // the dataset
  // also want to display a list of datasets associated with this project and team. We might
  // want to show all datasets for this project across all teams.  This will make it easier if
  // a device is used by mulitple teams out in the field.
  // my current approach is to use a tabbed navigation for this: "Add Dataset", "Dataset List"
  // if the datasets are not team specific then the "Add Dataset" could be the place to show and
  // and change the team information
};

Dataset.prototype.needsUploading = function() {
  return (this.status !== "uploaded" || (this.photo != null && this.photoStatus !== "uploaded"));
};

Dataset.prototype.submit = function(callback) {
  if(this.status === "uploaded"){
    if(this.photoStatus === "uploaded"){
      // nothing to do here
      callback(this);
    } else {
      // need to upload the video
      this._upload(callback);
    }
    return;
  }

  if(this.project.hasLocation() && (this.latitude == null || this.longitude == null)){
    this._getLocation(function(){
      // save after getting the location
      this.save();
      this._upload(callback);
    }.bind(this));
  } else {
    // either the project doesn't support location
    // or the location has already been looked up
    this._upload(callback);
  }
};

Dataset.prototype.dataForHumans = function(){
  var forHumans = {},
      field;

  for (var key in this.data) {
    if (this.data.hasOwnProperty(key)) {
      // need to look up the field name
      field = this.project.getField(key);
      dataSet[key] = [this.data[key]]
    }
  }
};

Dataset.prototype.save = function() {
  StorageManager.save(this, "Dataset", this.uri);
}

Dataset.prototype.serialize = function(manager){
  // return a json compatible object that includes
  // the references to the project and classPeriod

  // if the photo is a string it means it is path returned by Cordova to the
  // local file. In the interactive the photo will be a File object which
  // we currently do not handle serializing
  var photo = null;
  if(typeof this.photo === 'string' || this.photo instanceof String){
    photo = this.photo;
  }

  return ({
    uri: this.uri,
    project: this.project.isenseProjectLink(),
    classPeriod: this.classPeriod.uri,
    team: this.team.name,
    data: this.data,
    latitude: this.latitude,
    longitude: this.longitude,
    status: this.status,
    photo: photo,
    photoStatus: this.photoStatus,
    isenseID: this.isenseID
  });
};

Dataset.deserialize = function(manager, data){
  var project = manager.findRequired("Project", data.project),
      classPeriod = manager.findRequired("ClassPeriod", data.classPeriod),
      dataset;

  dataset = new Dataset(project, classPeriod, {name: data.team}, data.data);
  dataset.latitude = data.latitude;
  dataset.longitude = data.longitude;
  dataset.status = data.status;
  dataset.photo = data.photo;
  dataset.photoStatus = data.photoStatus;
  dataset.uri = data.uri;
  dataset.isenseID = data.isenseID;
  return dataset;
}

module.exports = Dataset;