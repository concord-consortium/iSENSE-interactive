var React = require('react');

var ClassPeriodView = React.createClass({
  render: function() {
      return (
        <span>{this.props.classPeriod.name},{" "}
              {this.props.classPeriod.teacherName},{" "}
              {this.props.classPeriod.state}
        </span>
      );
    }
});

module.exports = ClassPeriodView;
