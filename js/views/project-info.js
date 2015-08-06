var React = require('react');
var ProjectChooser = require('./project-chooser');

var ProjectInfo = React.createClass({
  getInitialState: function() {
  	return {
      changing: false
    };
  },

  onProjectChoosen: function(project) {
  	this.setState({changing: false});
  	this.props.onChange(project);
  },

  changeProjectRequest: function(e) {
  	e.preventDefault();
  	this.setState({changing: true});
  },

  render: function() {
  	if (this.state.changing){
	    return (<ProjectChooser projects={this.props.projects} onProjectChoosen={this.onProjectChoosen}/>);
	  } else {
      return (
        <div>Project: {this.props.project.name}
             <a href="change_project" onClick={this.changeProjectRequest}>change</a>
             <a href={this.props.project.isenseProjectLink} target="_blank">full iSENSE project</a>
        </div>
      );
    }
  }
});

module.exports = ProjectInfo;