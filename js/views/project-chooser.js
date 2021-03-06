var React = require('react');

var Nav = require('react-bootstrap/lib/nav');
var NavItem = require('react-bootstrap/lib/navitem');

var ProjectChooser = React.createClass({
  handleSelect: function(project){
    // do something here
    this.props.onProjectChoosen(project);
  },

  render: function() {
    if(window.projectNum && this.props.currentProject) {
      // add a link to the full iSENSE project
      return (
        <a href={this.props.currentProject.isenseProjectLink()} target='_blank'>Open Full iSENSE Project</a>
        );
    }

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

module.exports = ProjectChooser;