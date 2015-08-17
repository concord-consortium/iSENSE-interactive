var React = require('react');
var Button = require('react-bootstrap/lib/button')
var Input = require('react-bootstrap/lib/input')

var PhotoInput = require('./photo-input');

var ProjectDataEntry = React.createClass({
  getInitialState: function() {
  	return {
      // this could be an imageURI from cordova
      // or a File object from the browser
      photo: null,
      // these are the iSENSE field values
      data: {}
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

  // this is now going to require us to clear the form after submit
  // so the don't submit the same photo twice
  handlePhotoSelected: function(photo) {
    // photo can be a fileURI from cordova or a Browser File object
    this.setState({photo: photo});
  },

  handleFieldChange: function(fieldId, value) {
    // clone the data state
    var newState = JSON.parse(JSON.stringify(this.state.data));
    newState[fieldId] = value;
    this.setState({data: newState});
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
        <PhotoInput onPhotoSelected={this.handlePhotoSelected}/>
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
        labelClassName='col-xs-4'
        wrapperClassName='col-xs-8'
        value={this.props.value}
        onChange={this.handleChange}/>
    );
  }
});

module.exports = ProjectDataEntry;
