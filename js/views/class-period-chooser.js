var React = require('react');

var Input = require ('react-bootstrap/lib/input');
var Button = require ('react-bootstrap/lib/Button');
var ClassPeriodAddForm = require('./class-period-add-form');
var ClassPeriodView = require('./class-period-view');

var ClassPeriodChooser = React.createClass({
  getInitialState: function() {
    return {
      addingNewClassPeriod: false
    };
  },

  addNewClassPeriod: function(e){
    e.preventDefault();
    this.setState({addingNewClassPeriod: true});
  },

  onClassPeriodChoosen: function(classPeriod) {
    this.setState({addingNewClassPeriod: false});
    this.props.onClassPeriodChoosen(classPeriod);
  },

  cancelAddNewClassPeriod: function(){
    this.props.onClassPeriodChoosen(null);
  },

  render: function() {
    var existingClassChooser = false;

    // Need to test this path
    if (this.props.classPeriods.length !== 0) {
      existingClassChooser =
         <ClassPeriodChooserList
            classPeriods={this.props.classPeriods}
            onClassPeriodChoosen={this.props.onClassPeriodChoosen}/>;
    }

    return (
      <div>
        { existingClassChooser }
        <ClassPeriodAddForm onClassPeriodChoosen={this.onClassPeriodChoosen}/>
      </div>
    );
  }
});

var ClassPeriodChooserList = React.createClass({
  handleChange: function(e) {
    var match = null;
    this.props.classPeriods.forEach(function(classPeriod){
      if(classPeriod.uri === e.target.value){
        match = classPeriod;
      }
    });
    this.props.onClassPeriodChoosen(match);
  },

  render: function() {
    var list = [];
    this.props.classPeriods.forEach(function(classPeriod){
      list.push(
        <option value={classPeriod.uri}><ClassPeriodView classPeriod={classPeriod}/></option>
      );
    }.bind(this));

    return (
      <Input type='select' label='Select Existing Class' placeholder='select'
        onChange={this.handleChange}>
        {list}
      </Input>
    );
  }
});

module.exports = ClassPeriodChooser;

