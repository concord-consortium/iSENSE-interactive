var React = require('react');

var DatasetVisualization = React.createClass({
  render: function() {
    if(this.props.project === null ||
      this.props.classPeriod === null ||
      this.props.team === null){
      return (
        <div>
          A class, project, and team must be selected before viewing the visualization
        </div>
      );
    }

    if (this.props.teamDatasetList === null){
      return (
        <div>
          There is no data for this team.
        </div>);
    } else {
      var url = this.props.project.server + "/projects/" + this.props.project.id +
                "/data_sets/" + this.props.teamDatasetList + "?embed=true";
      return (
        <iframe src={ url } width='100%' height='560' allowFullScreen='true'></iframe>
        );
    }
  }
});

module.exports = DatasetVisualization;