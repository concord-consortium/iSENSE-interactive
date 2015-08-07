var React = require('react');

var Navbar = require('react-bootstrap/lib/navbar');
var PanelGroup = require('react-bootstrap/lib/panelgroup');
var Panel = require('react-bootstrap/lib/panel');

var ClassPeriodChooser = require('./class-period-chooser');
var ClassPeriod = require('../models/class-period');
var ProjectChooser = require('./project-chooser');
var Project = require('../models/project');
var TeamForm = require('./team-form');
var DatasetArea = require('./dataset-area');
var Dataset = require('../models/dataset');

var App = React.createClass({
  getInitialState: function() {

    this.mockProjects[0].load(this.projectLoadHandler);

    return {
      classPeriod: this.mockClassPeriods[0],
      project: this.mockProjects[0],
      team: {name: "My Team"},
      datasets: [],
      activePanel: false
  	};
  },

  mockProjects: [
	  new Project({
	   "id": "1186",
	   "name": "Interactive with Contributor Keys Test"
	  }),
	  new Project({
	    "id": "1187",
	    "name": "Build a better filter"
	  })
  ],

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
  	this.setState({team: newTeam});
  },

  projectChangeHandler: function(newProject) {
  	this.setState({project: newProject});
    // add a callback so we can update the view after it is loaded
    newProject.load(this.projectLoadHandler);
  },

  projectLoadHandler: function() {
    // there is probably is a better way to do this
    this.forceUpdate();
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
         <a target="_blank" href={this.props.project.isenseProjectLink}>full iSENSE project
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
              projects={this.mockProjects}
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

    // probably need to change some state to indicate that we are uploading
    // the dataset
    // also want to display a list of datasets associated with this project and team. We might
    // want to show all datasets for this project across all teams.  This will make it easier if
    // a device is used by mulitple teams out in the field.
    // my current approach is to use a tabbed navigation for this: "Add Dataset", "Dataset List"
    // if the datasets are not team specific then the "Add Dataset" could be the place to show and
    // and change the team information
  }
});

module.exports = App;