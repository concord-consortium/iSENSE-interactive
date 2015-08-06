var React = require('react');
var ClassPeriodChooser = require('./class-period-chooser');
var ClassPeriodView = require('./class-period-view');

var ClassPeriodInfo = React.createClass({
  getInitialState: function() {
  	return {
      changing: false
    };
  },

  onClassPeriodChoosen: function(classPeriod) {
  	this.setState({changing: false});
  	if(classPeriod !== null) {
  	  this.props.onChange(classPeriod);
    }
  },

  changeClassPeriodRequest: function(e) {
  	e.preventDefault();
  	this.setState({changing: true});
  },

  render: function() {
    if (this.state.changing){
	  return (<ClassPeriodChooser classPeriods={this.props.classPeriods} onClassPeriodChoosen={this.onClassPeriodChoosen}/>);
	} else {
      return (
        <div><ClassPeriodView classPeriod={this.props.classPeriod}/>
          <a href="change_class" onClick={this.changeClassPeriodRequest}>change</a>
        </div>
      );
    }
  }
});

module.exports = ClassPeriodInfo;
