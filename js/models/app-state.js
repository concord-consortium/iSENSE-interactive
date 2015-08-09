var Project = require('./project');
var StorageManager = require('./storage-manager');

var AppState = function(){
  this.datasets = [];
  this.projects = [];
  this.classPeriods = [];
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
          StorageManager.save(project, "Project", project.isenseProjectLink());
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

  // hack to check offline support
  oReq.open("get", 'resources/mock-project-list.json', true);
  oReq.send();

  // TODO: if this has succeded or timedout we need to call the callback
};

AppState.prototype.serialize = function(manager) {
  return {
    projects: this.projects.map(function(project){
      return project.isenseProjectLink();
    })
  };
};

AppState.deserialize = function(manager, data) {
  var appState = new AppState();
  appState.projects = data.projects.map(function(projectURI){
    return manager.findRequired("Project", projectURI);
  });
  return appState;
}

// DatasetList.prototype.push(dataset){
//   list.push(dataset);

//   // store the dataset in local storage
//   StorageManager.save(dataset, 'Dataset', dataset.uri);

//   // this is a singleton
//   StorageManager.save(this, 'DatasetList', 'singleton');
// }

// DatasetList.prototype.serialize(manager){
//   return list.map(function(item){
//     return item.uri;
//   });
// };

// DatasetList.deserialize(manager, uriList){
//   var datasetList = new DatasetList(),
//       dataset;
//   uriList.forEach(function(uri){
//     dataset = StorageManager.find('Dataset', uri)

//     // bypass the normal push so we don't trigger a save
//     this.list.push(dataset);
//   }.bind(this));
// }

module.exports = AppState;