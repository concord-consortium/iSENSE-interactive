var React = require('react');

var Input = require ('react-bootstrap/lib/input');
var Button = require ('react-bootstrap/lib/Button');
var ClassPeriodAddForm = require('./class-period-add-form');
var ClassPeriodView = require('./class-period-view');

var ClassPeriodChooser = React.createClass({
  render: function() {
    var existingClassChooser = false;

    // Need to test this path
    if (this.props.classPeriods.length !== 0) {
      existingClassChooser =
         <ClassPeriodChooserList
            classPeriod={this.props.classPeriod}
            classPeriods={this.props.classPeriods}
            onClassPeriodChoosen={this.props.onClassPeriodChoosen}/>;
    }

    return (
      <div>
        { existingClassChooser }
        <ClassPeriodAddForm onClassPeriodChoosen={this.props.onClassPeriodAdded}/>
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

    var defaultValue = false;
    if(this.props.classPeriod !== null){
      defaultValue = this.props.classPeriod.uri;
    }

    return (
      <Input type='select' defaultValue={defaultValue} label='Select Existing Class' placeholder='select'
        onChange={this.handleChange}>
        {list}
      </Input>
    );
  }
});

module.exports = ClassPeriodChooser;

