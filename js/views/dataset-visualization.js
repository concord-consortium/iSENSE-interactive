var React = require('react');

// It seems iSENSE returns 403 error if URL is longer than this.
const MAX_URL_LENGTH = 4090;

function getURL(server, projectId, datasetList) {
  return server + "/projects/" + projectId + "/data_sets/" + datasetList + "?embed=true";
}

function truncateURL(url) {
  while (url.length > MAX_URL_LENGTH) {
    // Remove first dataset ID.
    url = url.replace(/\/\d*,/, '/');
  }
  return url;
}

var DatasetVisualization = React.createClass({

  render: function () {
    if (this.props.project === null ||
      this.props.classPeriod === null ||
      this.props.team === null){
      return (
        <div>
          A class, project, and team must be selected before viewing the visualization
        </div>
      );
    }

    if (this.props.datasetList === null) {
      return <div> There is no data.</div>;
    } else if (this.props.datasetList === 'disabled') {
      return <div>Visualization is temporarily disabled. We are sorry for the inconvience.
      Any data you have submitted will be saved. If necessary, you can visit iSENSE directly
      to view the data.
      Expand the Project bar above, and click 'Open Full iSENSE Project'.</div>;
    } else if (this.props.datasetList === 'refreshing') {
      return <div>Visualization is updating...</div>;
    } else if (!this.props.opened) {
      // the user hasn't opened the tab yet so don't load the iframe
      return <div>Visualization is loading...</div>;
    } else {
      var url = getURL(this.props.project.server, this.props.project.id, this.props.datasetList);
      var truncated = false;
      if (url.length > MAX_URL_LENGTH) {
        url = truncateURL(url);
        truncated = true;
      }
      return (
        <div>
          {truncated && <div><b>Warning:</b> can't display all the datasets, some data was truncated.</div>}
          <iframe src={url} width='100%' height='400' allowFullScreen='true'></iframe>
        </div>
      );
    }
  }
});

module.exports = DatasetVisualization;
