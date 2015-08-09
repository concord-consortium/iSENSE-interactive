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
var Dataset = require('../models/dataset');

var StorageManager = require('../models/storage-manager');

var App = React.createClass({
  getInitialState: function() {
    return {
      classPeriod: this.mockClassPeriods[0],
      projects: [],
      project: null,
      team: {name: "My Team"},
      datasets: [],
      activePanel: false
  	};
  },

  componentDidMount: function() {
    // load the AppState instance or create a new one if it is not avialable
    StorageManager.initializeTypes();
    this.appState = StorageManager.find('AppState', 'singleton');
    if (this.appState === null) {
      this.appState = new AppState();
    }

    this.appState.updateProjects(function(error){
      // this will be called before each individual projects is loaded
      // but at least the list of projects will be available
      this.setState({projects: this.appState.projects});
      StorageManager.save(this.appState, 'AppState', 'singleton');
    }.bind(this));
  },

  // this is currently not used because all of the projects are loaded at the beginning
  // and we dont' have a way yet to know when a project is loaded
  projectLoadHandler: function() {
    // there is probably is a better way to do this
    this.forceUpdate();
  },

  mockClassPeriods: [
	new ClassPeriod({
		"uri": "https://itsi.portal.concord.org/classes/1",
		"name": "Period 1",
		"state": "MA",
		"teachers": [
		   {
		   	  "id": "https://itsi.portal.concord.org/users/1",
		   	  "first_name": "Scott",
		   	  "last_name": "Cytacki"
		   	}
		],
		"computed label_needs to be less than 40 chars": "ma-cytacki-period1"
	}),
	new ClassPeriod({
		"uri": "https://itsi.portal.concord.org/classes/2",
		"name": "Really Long Class Name Period 2",
		"state": "MA",
		"teachers": [
		   {
		   	  "id": "https://itsi.portal.concord.org/users/2",
		   	  "first_name": "Jerome",
		   	  "last_name": "Chang"
		   	}
		],
		"computed label_needs to be less than 40 chars": "ma-chang-period2"
	})
  ],

  classPeriodChangeHandler: function(newClassPeriod) {
  	this.setState({classPeriod: newClassPeriod, activePanel: false});
  },

  teamChangeHandler: function(newTeam) {
  	this.setState({team: newTeam, activePanel: false});
  },

  projectChangeHandler: function(newProject) {
  	this.setState({project: newProject, activePanel: false});
    // add a callback so we can update the view after it is loaded
    // in the app, instead of this we want to load all of the projects when
    // the app starts up.
    // in the interactive, this approach would be ok
    // newProject.load(this.projectLoadHandler);
  },


  handlePanelSelect: function(activeKey) {
    if(this.state.activePanel === activeKey){
      this.setState({activePanel: false});
    } else {
      this.setState({activePanel: activeKey});
    }
  },

  _projectHeader: function() {
    if(this.state.project === null){
      return "Select a Project";
    }

     var projectHeader = [
       "Project: " + this.state.project.name
     ]

    // enabled when this is running as an interactive
    if(false) {
      projectHeader.push(
         <a target="_blank" href={this.props.project.isenseProjectLink()}>full iSENSE project
         </a>)
    }

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
      <div>
        <Navbar brand='Water SCIENCE Monitor' inverse/>
        <PanelGroup activeKey={this.state.activePanel} onSelect={this.handlePanelSelect} accordion>
          <Panel
              eventKey='classPeriod'
              header={this._classPeriodHeader()}>
            <ClassPeriodChooser
              classPeriods={this.mockClassPeriods}
              onClassPeriodChoosen={this.classPeriodChangeHandler}/>
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
          classPeriod={this.state.classPeriod}/>
      </div>
    );
  },

  submitData: function(data) {
    var dataset = new Dataset(this.state.project,
           this.state.classPeriod, this.state.team, data),
        newDatasets = [];

    dataset.submit(function (uploadedDataset, result){
      // there should be a better way to do this so we only update the dataset that changed
      this.forceUpdate();
    }.bind(this));

    // keep track of these datasets so we can display them
    newDatasets = this.state.datasets.slice(0);
    newDatasets.push(dataset);
    this.setState({datasets: newDatasets});

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