var React = require('react');
var TabbedArea = require('react-bootstrap/lib/tabbedarea');
var TabPane = require('react-bootstrap/lib/tabpane');
var DatasetList = require('./dataset-list')
var ProjectDataEntry = require('./project-data-entry');

var DatasetArea = React.createClass({
  render: function() {
    return (
      <TabbedArea defaultActiveKey={1}>
        <TabPane eventKey={1} tab='Add Dataset'>
          <ProjectDataEntry project={this.props.project}/>
        </TabPane>
        <TabPane eventKey={2} tab='List Datasets'>
          <DatasetList
            project={this.props.project}
            datasets={this.props.datasets}
            classPeriod={this.props.classPeriod}/>
        </TabPane>
      </TabbedArea>
    );
  }
});

module.exports = DatasetArea;
