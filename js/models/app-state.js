var Project = require('./project');
var StorageManager = require('./storage-manager');

var AppState = function(){
  this.datasets = [];
  this.projects = [];
  this.classPeriods = [];

  this.project = null;
  this.classPeriod = null;
};

AppState.prototype.updateProjects = function(callback){
  var oReq = new XMLHttpRequest(),
  self = this;

  oReq.onload = function () {
  	if(this.status !== 200){
  		callback(true);
  		return;
  	}

    var existingProjectsMap = {};
    self.projects.forEach(function(project){
    	existingProjectsMap[project.isenseProjectLink()] = project;
    });

    var data = JSON.parse(this.responseText);
    self.projects = data.map(function(basicProject) {
    	// check if we already have a project object for this basicProject
    	// if so then keep that one because it might have been populated from iSENSE
    	// otherwise save the basicProject
    	// we want to save these basic projects incase the load call fails or is too
    	// slow
    	basicProject = new Project(basicProject);
    	if(basicProject.isenseProjectLink() in existingProjectsMap){
          return existingProjectsMap[basicProject.isenseProjectLink()];
    	} else {
          StorageManager.save(basicProject, "Project", basicProject.isenseProjectLink());
          return basicProject;
    	}
    });

    // now load each of the projects and save them in the state
    self.projects.forEach(function(project) {
      project.load(function(){
      	StorageManager.save(project, "Project", project.isenseProjectLink())
      });
    });

    callback(false);
  };

  oReq.onerror = function () {
  	callback(true);
  };

  oReq.onabort = function () {
  	callback(true);
  };

  oReq.open("get", 'https://s3.amazonaws.com/static.concord.org/WaterSCIENCE/isense-projects.json', true);
  oReq.send();

  // TODO: if this has succeded or timedout we need to call the callback
};

AppState.prototype.addDataset = function(dataset) {
  this.datasets.push(dataset);
  dataset.save();
  this.save();
};

AppState.prototype.addClassPeriod = function(classPeriod) {
  this.classPeriods.push(classPeriod);

  // Save the dataset
  StorageManager.save(classPeriod, 'ClassPeriod', classPeriod.uri);

  // save ourselves
  this.save();
};

AppState.prototype.uploadDatasets = function(callback) {
  this.datasets.forEach(function(dataset){
    if(dataset.status !== 'uploaded'){
      dataset.submit(function(){
        // need to resave the dataset
        dataset.save();
        // need to change the state on the app incase the user has the datasets tab open
        // also this will will cause the number in the status to decrease
        callback(dataset);
      })
    }
  });
}

AppState.prototype.save = function() {
  StorageManager.save(this, "AppState", 'singleton');
};

AppState.prototype.serialize = function(manager) {
  var data = {
    projects: this.projects.map(function(project){
      return project.isenseProjectLink();
    }),
    classPeriods: this.classPeriods.map(function(classPeriod){
      return classPeriod.uri;
    }),
    datasets: this.datasets.map(function(dataset){
      return dataset.uri;
    })
  };

  if(this.project !== null){
    data.project = this.project.isenseProjectLink();
  }

  if(this.classPeriod !== null){
    data.classPeriod = this.classPeriod.uri;
  }

  return data;
};

AppState.deserialize = function(manager, data) {
  var appState = new AppState();
  appState.projects = data.projects.map(function(projectURI){
    return manager.findRequired("Project", projectURI);
  });
  appState.classPeriods = data.classPeriods.map(function(classPeriodURI){
    return manager.findRequired("ClassPeriod", classPeriodURI);
  });
  appState.datasets = data.datasets.map(function(datasetURI){
  	return manager.findRequired("Dataset", datasetURI);
  })
  if('project' in data){
    appState.project = manager.findRequired("Project", data.project);
  }

  if('classPeriod' in data){
    appState.classPeriod = manager.findRequired("ClassPeriod", data.classPeriod);
  }

  return appState;
}

module.exports = AppState;