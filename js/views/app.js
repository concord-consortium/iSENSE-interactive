var React = require('react');

var Navbar = require('react-bootstrap/lib/navbar');
var PanelGroup = require('react-bootstrap/lib/panelgroup');
var Panel = require('react-bootstrap/lib/panel');


var AppState = require('../models/app-state');
var ClassPeriodChooser = require('./class-period-chooser');
var ClassPeriod = require('../models/class-period');
var ProjectChooser = require('./project-chooser');
var Project = require('../models/project');
var TeamForm = require('./team-form');
var DatasetArea = require('./dataset-area');
var DatasetUploader = require('./dataset-uploader');
var Dataset = require('../models/dataset');

var StorageManager = require('../models/storage-manager');

var App = React.createClass({
  getInitialState: function() {
    return {
      classPeriods: [],
      classPeriod: null,
      projects: [],
      project: null,
      team: null,
      datasets: [],
      activePanel: false,
      teamDatasetList: null,
      submissionProgress: null
  	};
  },

  componentDidMount: function() {
    // load the AppState instance or create a new one if it is not avialable
    StorageManager.initializeTypes();
    this.appState = StorageManager.find('AppState', 'singleton');
    if (this.appState === null) {
      this.appState = new AppState();
    }

    this.setState({
      datasets: this.appState.datasets,
      classPeriods: this.appState.classPeriods,
      project: this.appState.project,
      classPeriod: this.appState.classPeriod
    });

    this.appState.updateProjects(function(error){
      // this will be called before each individual projects is loaded
      // but at least the list of projects will be available
      this.setState({projects: this.appState.projects});
      this.appState.save();
    }.bind(this));
  },

  // this is currently not used because all of the projects are loaded at the beginning
  // and we dont' have a way yet to know when a project is loaded
  projectLoadHandler: function() {
    // there is probably is a better way to do this
    this.forceUpdate();
  },

  handleClassPeriodChange: function(newClassPeriod) {
    // the user has selected an existing classperiod
    this.appState.classPeriod = newClassPeriod;
    this.appState.save();
  	this.setState({classPeriod: newClassPeriod, activePanel: false});
    this.updateTeamDatasetList();
  },

  handleClassPeriodAdd: function(addedClassPeriod) {
    // the user has added a new class period
    // it is possible that this added Class is actually one that
    // already exists in the app, so in that case we need to use the same
    // object otherwise other object references like the dataset will
    // get confused.
    var storedClassPeriod = StorageManager.find("ClassPeriod", addedClassPeriod.uri);
    if(storedClassPeriod !== null){
      // there is a chance that the class name has changed or the teacher's
      // name has changed, but that is slim and this isn't the place to handle that
      addedClassPeriod = storedClassPeriod;
    } else {
      this.appState.addClassPeriod(addedClassPeriod);
    }
    this.appState.classPeriod = addedClassPeriod;
    this.appState.save();
    this.setState({classPeriod: addedClassPeriod, activePanel: false});
    this.updateTeamDatasetList();

    // send this classperiod info to isense-key-maker, so the contributor key is ready
    // when we need it
    // We should add some kind of info so the user knows they can go offline
    // there is another case to handle: when a new project is added,
    // so really this should coordinate with the key-maker so it knows which projects
    // have had the key set. And then if a new project shows up the classPeriod can
    // make sure to register that key to.
    addedClassPeriod.registerKeys(function(){
      // the contributor keys have now been registered with iSENSE
      // do something to let the user know.
    });

  },

  teamChangeHandler: function(newTeam) {
    // we need to use a callback here because otherwise this.state.team won't be set yet
  	this.setState({team: newTeam, activePanel: false}, function(){
      this.updateTeamDatasetList();
    }.bind(this));
  },

  updateTeamDatasetList: function () {
    if(this.appState.project == null || this.appState.classPeriod == null || this.state.team == null) {
      return;
    }

    this.appState.project.getTeamDatasetList(this.appState.classPeriod, this.state.team,
      function (datasetList) {
        this.setState({teamDatasetList: datasetList});
      }.bind(this));
  },

  projectChangeHandler: function(newProject) {
    this.appState.project = newProject;
    this.appState.save();

  	this.setState({project: newProject, activePanel: false});
    // add a callback so we can update the view after it is loaded
    // in the app, instead of this we want to load all of the projects when
    // the app starts up.
    // in the interactive, this approach would be ok
    // newProject.load(this.projectLoadHandler);
    this.updateTeamDatasetList();
  },

  handlePanelSelect: function(activeKey) {
    if(this.state.activePanel === activeKey){
      this.setState({activePanel: false});
    } else {
      this.setState({activePanel: activeKey});
    }
  },

  handleUploadDatasets: function() {
    this.appState.uploadDatasets(function(dataset){
      this.forceUpdate();
    }.bind(this));
  },

  _projectHeader: function() {
    if(this.state.project == null){
      return "Select a Project";
    }

     var projectHeader = [
       "Project: " + this.state.project.name
     ]

    // I tried enabling this when running as an interactive
    // but the panel header click handling prevented users from clicking on it
    // the same link can be found under the 'Visualize Datasets' tab
    // if(window.fromBrowser) {
    //   projectHeader.push(" ");
    //   projectHeader.push(
    //      <a target="_blank" href={this.state.project.isenseProjectLink()}>full iSENSE project
    //      </a>)
    // }

    return projectHeader;
  },

  _classPeriodHeader: function() {
    if(this.state.classPeriod === null){
      return "Add a Class";
    } else {
      return "Class: " + this.state.classPeriod.summaryText();
    }
  },

  _teamHeader: function() {
    if(this.state.team === null){
      return "Enter Your Team";
    } else {
      return "Team: " + this.state.team.name;
    }
  },

  render: function() {
    // We might also want to keep a list of teams to make it easier for teams to
    // see the teams that they have used before
    // but this is something that seems not critical for the first version
    return (
      <div className="full-page">
        <div className="page-wrap">
          <Navbar brand='Water SCIENCE Monitor' inverse/>
          <div id='content'>
            <PanelGroup activeKey={this.state.activePanel} onSelect={this.handlePanelSelect} accordion>
              <Panel
                  eventKey='classPeriod'
                  header={this._classPeriodHeader()}>
                <ClassPeriodChooser
                  classPeriod={this.state.classPeriod}
                  classPeriods={this.state.classPeriods}
                  onClassPeriodChoosen={this.handleClassPeriodChange}
                  onClassPeriodAdded={this.handleClassPeriodAdd}/>
              </Panel>
              <Panel
                  eventKey='project'
                  header={this._projectHeader()}>
                <ProjectChooser
                  currentProject={this.state.project}
                  projects={this.state.projects}
                  onProjectChoosen={this.projectChangeHandler}/>
              </Panel>
              <Panel
                  eventKey='team'
                  header={this._teamHeader()}>
                <TeamForm
                  team={this.state.team}
                  onChange={this.teamChangeHandler}/>
              </Panel>
            </PanelGroup>
            <DatasetArea
              project={this.state.project}
              datasets={this.state.datasets}
              classPeriod={this.state.classPeriod}
              team={this.state.team}
              submissionProgress={this.state.submissionProgress}
              teamDatasetList={this.state.teamDatasetList}
              onUploadDatasets={this.handleUploadDatasets}/>
          </div>
        </div>
        <footer className="site-footer">
          <DatasetUploader datasets={this.state.datasets} onUploadDatasets={this.handleUploadDatasets}/>
        </footer>
      </div>
    );
  },

  submitData: function(data) {
    var dataset = new Dataset(this.state.project,
           this.state.classPeriod, this.state.team, data.data, data.photo),
        newDatasets = [];

    this.setState({submissionProgress: 20});
    dataset.submit(true,
      function (progress) {
        this.setState({submissionProgress: progress});
      }.bind(this),
      function (uploadedDataset, result){
        // we are done with submitting so hide the progress bar again
        this.setState({submissionProgress: null});

        // the dataset should be successfully uploaded
        // need to resave it since the status should have changed
        dataset.save();

        // this should have added another one to the list
        this.updateTeamDatasetList();

        // there should be a better way to do this so we only update the dataset that changed
        this.forceUpdate();
      }.bind(this));

    this.appState.addDataset(dataset);
    this.setState({datasets: this.appState.datasets});

    // need to change some state to indicate that we are uploading otherwise the submit
    // doesn't provide feedback

    // save this new dataset to local storage. Ideally we'd use localStorage as the main location
    // for these datasets. But that doesn't work well with react since it needs to use the 
    // set state.  So localStorage is going to have to be be a copy, and then when a dataset is
    // updated we need to update localStorage too.  We could let the DataSet class work with its
    // local storage object, but I we need to assume that localStorage requires calling 'set'
    // inorder to update. So if we are storing more than this list of datasets we should put the 
    // datasets in their own key and update this whole key each time a new one is added
    // then when the app loads we 'rehydrate'  the dataset objects from localStorage
    // the dataset can save a pointer to its project this way when it is rehydrated that can
    // be looked up again, it also needs to save the class info and team
    // the dataset needs enough info to be submitted again
    // to keep things consitent we need to save the following in localstorage:
    //  - projects
    //  - classPeriods
    //  - datasets
    // the serialized dataset can reference the project with an URL, the classPeriod with an URL
    // serialization: the project, classPeriod, and dataset can provide their own serialize methods they have
    // access to all they need.
    // deserialization: the project, and classPeriod can deserialize themselves. The dataset would need access
    //   to a service so it can look up the project and classPeriod associated with itself
    //     - or -
    //   the dataset can be changed to always just store these URLs and have access to a lookup map
    //    to find the objects when they are needed, currently this lookup when it is submitted and when getting
    //    the human data
    //     - or -
    //   a serialization manager can know enough about the state to look up the Project and ClassPeriod for
    //    the dataset

    // We also need to store the projects in local storage, otherwise out in the field users won't
    // be able to enter data


  }
});

module.exports = App;