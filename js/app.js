var App = React.createClass({
  getInitialState: function() {

  	return {
      classPeriod: this.mockClassPeriods[0],
      project: {name: "My Project"},
      team: {name: "My Team"}
  	};
  },

  mockProjects: [
	  {
	   "id": "1186",
	   "name": "Interactive with Contributor Keys Test"
	  },
	  {
	    "id": "1187",
	    "name": "Build a better filter"
	  }
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
      </div>
    );
  }
});