var App = React.createClass({
  getInitialState: function() {

    this.mockProjects[0].load(this.projectLoadHandler);

    return {
      classPeriod: this.mockClassPeriods[0],
      project: this.mockProjects[0],
      team: {name: "My Team"}
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
		"name": "Period 2",
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
  	this.setState({classPeriod: newClassPeriod});
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

  render: function() {
    return (
      <div>
        <ClassPeriodInfo
          classPeriod={this.state.classPeriod}
          classPeriods={this.mockClassPeriods}
          onChange={this.classPeriodChangeHandler}/>
        <ProjectInfo
          project={this.state.project}
          projects={this.mockProjects}
          onChange={this.projectChangeHandler}/>
        <TeamInfo
          team={this.state.team}
          onChange={this.teamChangeHandler}/>
        <ProjectDataEntry project={this.state.project}/>
      </div>
    );
  },

  submitData: function(data) {
    // this.state.project will do the actual submission
    // this.state.classPeriod contains data for the built in fields in the project
    // data contains the data for the fields defined in the project
    // this requires the contributor key to have been created in iSENSE first
    // Get the variables that the user entered in the HTML portion of the app.
    // Data to be uploaded to iSENSE
    var dataSet = {},
        fieldIDs = this.state.project.fieldIDs;

    // TODO store the team name as teamName - className to make filtering easier for teachers
    dataSet[fieldIDs.teamName] = [this.state.team.name];
    dataSet[fieldIDs.className] = [this.state.classPeriod.name];
    dataSet[fieldIDs.teacherName] = [this.state.classPeriod.teacherName];
    dataSet[fieldIDs.state] = [this.state.classPeriod.state];

    // add position data if it exists
    // if (position.latitude && position.longitude){
    //   data[latitudeFieldNumber] = [position.latitude];
    //   data[longitudeFieldNumber] = [position.longitude];
    // }

    // add all input field values to the data set
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        dataSet[key] = [data[key]]
      }
    }

    this.state.project.uploadData({
      contributionKey : this.state.classPeriod.contributorKey(),
      contributorName : this.state.team.name,
      data            : dataSet
    });

    // probably need to change some state to indicate that we are uploading
    // the dataset
  }
});