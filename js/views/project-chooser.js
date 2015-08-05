var ProjectChooser = React.createClass({
  render: function() {
	  // need a list of projects to choose from
	  var projectList = [];
	  this.props.projects.forEach(function(project){
	  	projectList.push(
        <li>
          <ProjectChooserItem project={project} onSelect={this.props.onProjectChoosen}/>
        </li>);
	  }.bind(this));

	  return (
	  	<div>
		  	<h2>Choose a Project</h2>
		  	<ul>
		  	  {projectList}
		  	</ul>
		  </div>
	  );
  }
});

var ProjectChooserItem = React.createClass({
  selectProject: function(e) {
    e.preventDefault();
    this.props.onSelect(this.props.project);
  },

  render: function() {
    var projectURL = "project/" + this.props.project.id;
    return (
      <a href={projectURL}
         onClick={this.selectProject}
      >
        {this.props.project.name}
      </a>
    );
  }
});