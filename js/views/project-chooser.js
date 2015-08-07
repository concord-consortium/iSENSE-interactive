var React = require('react');

var Nav = require('react-bootstrap/lib/nav');
var NavItem = require('react-bootstrap/lib/navitem');

var ProjectChooser = React.createClass({
  handleSelect: function(project){
    // do something here
    this.props.onProjectChoosen(project);
  },

  render: function() {
	  var projectList = this.props.projects.map(function(project){
	  	return(
        <NavItem eventKey={project}>{project.name}</NavItem>
      )
	  });

	  return (
      <div>
	  	  <Nav stacked bsStyle='pills' activeKey={this.props.currentProject} onSelect={this.handleSelect}>
          {projectList}
        </Nav>
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

module.exports = ProjectChooser;