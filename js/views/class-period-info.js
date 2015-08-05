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

var ClassPeriodView = React.createClass({
  render: function() {
      return (
        <span>Class: {this.props.classPeriod.name},
              Teacher: {this.props.classPeriod.teacherName},
              State: {this.props.classPeriod.state}
        </span>
      );
    }
});