var Project = require('./project');
var StorageManager = require('./storage-manager');

var AppState = function(){
  this.datasets = [];
  this.projects = [];
  this.classPeriods = [];

  this.project = null;
  this.classPeriod = null;
  this.team = null;
};

AppState.prototype.updateProjects = function(callback){
  // fail fast
  if(window.projectNum) {
    throw "updateProjects should not be called when the projectNum is set";
  }
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
        basicProject.save();
        return basicProject;
    	}
    });

    // now load each of the projects and save them in the state
    self.projects.forEach(function(project) {
      project.load(function(){
        project.save();
        callback(false, project);
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

  oReq.open("get", 'https://s3.amazonaws.com/static.concord.org/WaterSCIENCE/isense-project-list.json', true);
  // oReq.open("get", 'resources/waterscience-project-list.json', true);
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

  // Save the class
  if(window.EMBEDDED){
    // don't save to local storage when running embedded
    // instead we should save this into the containers global storage so other embedded interactives
    // can access this same classPeriod info
  } else {
    StorageManager.save(classPeriod, 'ClassPeriod', classPeriod.uri);
  }

  // save ourselves
  this.save();
};

AppState.prototype.uploadDatasets = function(callback) {
  this.datasets.forEach(function(dataset){
    if(dataset.needsUploading()){
      // passing false here so the location is not found
      // these datasets could be uploaded in a much different place than where they
      // were initially submited
      dataset.submit(false,
        function(progress){},
        function(){
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
  if(window.EMBEDDED){
    // don't save to local storage when embedded
  } else {
    StorageManager.save(this, "AppState", 'singleton');
  }
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

  // We should not save this if the project was set via a URL param
  // but at the same time we don't want to nullify what was saved
  // before. Perhaps the most simple approach is that we don't save
  // the project link at all when running in the browser, so this
  // assumes in the browser the project id will almost always be
  // set via the URL
  if(this.project != null){
    data.project = this.project.isenseProjectLink();
  }

  if(this.classPeriod != null){
    data.classPeriod = this.classPeriod.uri;
  }

  if(this.team != null) {
    data.team = this.team;
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

  if('team' in data){
    appState.team = data.team;
  }

  return appState;
}

module.exports = AppState;