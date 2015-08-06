var React = require('react');

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

module.exports = ClassPeriodView;
