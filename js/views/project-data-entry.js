var React = require('react');
var Button = require('react-bootstrap/lib/button');
var Input = require('react-bootstrap/lib/input');
var ProgressBar = require('react-bootstrap/lib/progressbar');
var ButtonToolbar = require('react-bootstrap/lib/buttontoolbar');

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

    var progressBar = false;
    // 0 or null mean no progress
    if(this.props.progress) {
      progressBar = <ProgressBar
        active={this.props.progress !== 100}
        now={this.props.progress}
        style={{marginBottom: '0px', marginTop: '6px', marginLeft: '6px', width: '150px', float: 'left'}}/>
    }

    // need to add a field for the image
    return (
      <form className="form-horizontal">
        {rows}
        <PhotoInput onPhotoSelected={this.handlePhotoSelected}/>
        <ButtonToolbar>
          <Button onClick={this.submitHandler}>Submit Data</Button>
          {progressBar}
        </ButtonToolbar>
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
        label,
        inputType = "text",
        inputChildren = false;

    if(field.unit) {
      unitString = " (" + field.unit + ")";
    }

    label = field.name + " " + unitString;

    // this is a number field
    if(field.type == 2){
      inputType = "number";
    }

    if(field.restrictions && field.restrictions.length > 0){
      inputType = "select";
      inputChildren = [];
      field.restrictions.forEach(function(option){
        inputChildren.push(
          <option value={option}>{option}</option>
        );
      });
    }

    // TODO add support for contratined text fields so they show a select box
    return (
      <Input
        type={inputType}
        label={label}
        labelClassName='col-xs-4'
        wrapperClassName='col-xs-8'
        value={this.props.value}
        onChange={this.handleChange}>
        {inputChildren}
      </Input>
    );
  }
});

module.exports = ProjectDataEntry;
