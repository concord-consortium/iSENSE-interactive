var React = require('react');
var Table = require('react-bootstrap/lib/table');

var DatasetList = React.createClass({
  render: function() {

  	// need to go through the passed in datasets array
  	// only include datasets that have the same project and classPeriod
  	var datasetRows = [];
  	this.props.datasets.forEach(function (dataset) {
  		if(dataset.project === this.props.project &&
  		   dataset.classPeriod === this.props.classPeriod) {
  			datasetRows.push(
  				<DatasetListItem project={this.props.project} dataset={dataset}/>);
  		}
  	}.bind(this));

    if(datasetRows.length === 0) {
      return (
        <div>No datasets have been submitted for this project and class</div>
      );
    }

    var headers = [];

    headers.push(<th>Team</th>);

    this.props.project.dataFields.forEach(function(field){
      var unitString = "";

      if(field.unit) {
        unitString = "(" + field.unit + ")";
      }

      headers.push(<th>{field.name}<br/>{unitString}</th>);
    });
    headers.push(<th>Status</th>);
    headers.push(<th>Photo</th>);

    return (
      <Table bordered={false} responsive>
        <thead>
          {headers}
        </thead>
        <tbody>
          {datasetRows}
        </tbody>
      </Table>
    );
  }
});

var DatasetListItem = React.createClass({

  render: function() {
    var dataFields = [];
    this.props.project.dataFields.forEach(function(field){
      if(field.id in this.props.dataset.data){
        dataFields.push(<td>{this.props.dataset.data[field.id]}</td>);
      } else {
        dataFields.push(<td></td>);
      }
    }.bind(this));

  	return (
  		<tr>
  		  <td>{this.props.dataset.team}</td>
        {dataFields}
        <td>{this.props.dataset.status}</td>
        <td>{this.props.dataset.photoStatus}</td>
  		</tr>
  		);
  }
});

module.exports = DatasetList;