var React = require('react');
var TabbedArea = require('react-bootstrap/lib/tabbedarea');
var TabPane = require('react-bootstrap/lib/tabpane');
var DatasetList = require('./dataset-list')
var DatasetVisualization = require('./dataset-visualization');
var ProjectDataEntry = require('./project-data-entry');

var DatasetArea = React.createClass({
  handleTabSelect: function (key) {
    this.props.onSelect(key);
  },

  render: function() {
    var addDatasetTab =
      <TabPane eventKey='add' tab='Add Dataset'>
        <ProjectDataEntry
          project={this.props.project}
          classPeriod={this.props.classPeriod}
          team={this.props.team}
          progress={this.props.submissionProgress}/>
      </TabPane>;
    var listDatasetsTab =
      <TabPane eventKey='list' tab='List Datasets'>
        <DatasetList
          project={this.props.project}
          datasets={this.props.datasets}
          classPeriod={this.props.classPeriod}/>
      </TabPane>;
    var visualizeDatasetsTab =
      <TabPane eventKey='visualize' tab='Visualize Datasets'>
        <DatasetVisualization
          project={this.props.project}
          classPeriod={this.props.classPeriod}
          team={this.props.team}
          teamDatasetList={this.props.teamDatasetList}
          visible={this.props.tabKey === 'visualize'}/>
      </TabPane>;

    var tabs = [addDatasetTab, listDatasetsTab];
    // if we are embedded then add a new tab for visualize
    if(window.EMBEDDED){
      tabs = [addDatasetTab, visualizeDatasetsTab];
    }

    return (
      <TabbedArea activeKey={this.props.tabKey} onSelect={this.handleTabSelect}>
        { tabs }
      </TabbedArea>
    );
  }
});

module.exports = DatasetArea;
