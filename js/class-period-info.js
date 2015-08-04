var ClassPeriodInfo = React.createClass({
  getInitialState: function() {
  	return {
      changing: false
    };
  },

  onClassPeriodChoosen: function(classPeriod) {
  	this.setState({changing: false});
  	this.props.onChange(classPeriod);
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
        <div>Class: {this.props.classPeriod.name}, {this.props.classPeriod.teacherName}, {this.props.classPeriod.state}
          <a href="change_class" onClick={this.changeClassPeriodRequest}>change</a>
        </div>
      );
    }
  }
});