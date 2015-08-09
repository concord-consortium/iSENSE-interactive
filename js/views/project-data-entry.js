var React = require('react');
var Button = require('react-bootstrap/lib/button')

var ProjectDataEntry = React.createClass({
  getInitialState: function() {
  	return {
    };
  },

  submitHandler: function(e) {
    e.preventDefault();
    console.log("Submitting state");
    console.log(this.state);

    // send the data to our top level App component so it can construct the data to send
    // to iSENSE
    WS.submitData(this.state);
  },

  handleFieldChange: function(fieldId, value) {
    var newState = {};
    newState[fieldId] = value;
    this.setState(newState);
  },

  render: function() {
    if(this.props.project === null){
      return false;
    }

    if(this.props.project.loading){
      return (
        <div>Loading Project Information...</div>
      );
    }

    if(this.props.project.isenseProject === null){
      return (
        <div>Unable to load Project Information</div>
      );
    }

    var rows = [];
    this.props.project.dataFields.forEach(function(field){
      rows.push(
          <ProjectFormField field={field} value={this.state[field.id]} onChange={this.handleFieldChange}/>
      );
    }.bind(this));

    return (
      <div>Project Fields for: {this.props.project.name}
        {rows}
        <Button onClick={this.submitHandler}>Submit Data</Button>
      </div>
    );
  }
});

var ProjectFormField = React.createClass({
  handleChange: function(event) {
    var text = event.target.value;
    this.props.onChange(this.props.field.id, text);
  },

  render: function() {
    var unitString = "",
        field = this.props.field;

    if(field.unit) {
      unitString = " (" + field.unit + ")";
    }

    // TODO add support for contratined text fields so they show a select box
    return (
      <div>
        <dt><label htmlFor={field.id}>{field.name} {unitString}</label></dt>
        <dd><input type="text" ref="input" value={this.props.value} onChange={this.handleChange}/></dd>
      </div>
    );
  }
});

module.exports = ProjectDataEntry;
