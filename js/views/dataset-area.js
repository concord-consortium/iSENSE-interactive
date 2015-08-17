var React = require('react');
var TabbedArea = require('react-bootstrap/lib/tabbedarea');
var TabPane = require('react-bootstrap/lib/tabpane');
var DatasetList = require('./dataset-list')
var DatasetVisualization = require('./dataset-visualization');
var ProjectDataEntry = require('./project-data-entry');

var Button = require('react-bootstrap/lib/Button')

var DatasetArea = React.createClass({
  render: function() {
    var addDatasetTab =
      <TabPane eventKey='add' tab='Add Dataset'>
        <ProjectDataEntry
          project={this.props.project}
          classPeriod={this.props.classPeriod}
          team={this.props.team}/>
      </TabPane>;
    var listDatasetsTab =
      <TabPane eventKey='list' tab='List Datasets'>
        <DatasetList
          project={this.props.project}
          datasets={this.props.datasets}
          classPeriod={this.props.classPeriod}/>
      </TabPane>
    var visualizeDatasetsTab =
      <TabPane eventKey='visualize' tab='Visualize Datasets'>
        <DatasetVisualization
          project={this.props.project}
          classPeriod={this.props.classPeriod}
          team={this.props.team}
          teamDatasetList={this.props.teamDatasetList}/>
      </TabPane>

    var tabs = [addDatasetTab, listDatasetsTab];
    // if we are in the browser add a new tab for visualize
    if(window.fromBrowser){
      tabs = [addDatasetTab, visualizeDatasetsTab, listDatasetsTab];
    }

    return (
      <div>
        <div>
          <TabbedArea defaultActiveKey='add'>
            { tabs }
          </TabbedArea>
        </div>
        <DatasetUploader datasets={this.props.datasets} onUploadDatasets={this.props.onUploadDatasets}/>
      </div>
    );
  }
});

var DatasetUploader = React.createClass({
  notUploaded: function() {
    var count = 0;
    this.props.datasets.forEach(function(dataset){
      if(dataset.needsUploading()) {
        count++;
      }
    });
    return count;
  },

  datasetStatus: function() {
    switch(this.notUploaded()){
      case 0:
        if (this.props.datasets.length === 0){
          return "No datasets submitted";
        } else {
          return "All datasets are uploaded";
        }
      case 1:
        return "1 dataset has not been uploaded";
      default:
        return this.notUploaded() + " datasets have not been uploaded";
    }
  },

  render: function() {
    // need to check if we are running in the app or interactive
    // need to disable the button if there are no datasets to upload
    return (
      <div>
        {this.datasetStatus()}{" "}
        <Button
          disabled={this.notUploaded() === 0}
          onClick={this.props.onUploadDatasets}>Upload</Button>
      </div>
    );
  }
});

// Need a way to know how many datasets need to be uploaded still
// and display them here along with a button to uploade them

module.exports = DatasetArea;
