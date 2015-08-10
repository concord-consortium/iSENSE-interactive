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
    if(this.props.project === null ||
       this.props.classPeriod === null ||
       this.props.team === null){
      return (
        <div>A project, class, and team must be selected before adding data</div>
      );
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

    // need to add a field for the image
    return (
      <form className="form-horizontal">
        {rows}
        <Button onClick={this.submitHandler}>Submit Data</Button>
      </form>
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
        field = this.props.field,
        label;

    if(field.unit) {
      unitString = " (" + field.unit + ")";
    }

    label = field.name + " " + unitString;

    // TODO add support for contratined text fields so they show a select box
    return (
      <Input
        type="text"
        label={label}
        labelClassName='col-xs-2'
        wrapperClassName='col-xs-10'
        value={this.props.value}
        onChange={this.hangleChange}/>
    );
  }
});

module.exports = ProjectDataEntry;
