var React = require('react');

var Button = require('react-bootstrap/lib/Button')

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

module.exports = DatasetUploader;
