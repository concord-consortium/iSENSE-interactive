var Dataset = function(project, classPeriod, team, data){
  this.project = project;
  this.classPeriod = classPeriod;
  this.team = team;
  this.data = data;
  // could be created, uploading, uploaded, failed, or saved
  this.status = "created";
  // this is the id of the dataset stored in isense
  this.isenseID = "";
};

Dataset.prototype.submit = function(callback) {
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
    // if (position.latitude && position.longitude){
    //   data[latitudeFieldNumber] = [position.latitude];
    //   data[longitudeFieldNumber] = [position.longitude];
    // }

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

      if (typeof callback !== 'undefined'){
        callback(this, isenseResult);
      }

      // we used to upload images at this point
      // var uploadingImage =
      //   uploadImage('file-select', server, datasetResult.id, contributionKey, combinedTeamName(),
      //               function(){
      //                  updateVisualization();
      //               })

      // if(!uploadingImage){
      //   updateVisualization();
      // }
      // need to fire the callback to update the state

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

module.exports = Dataset;