var React = require('react');
var TabbedArea = require('react-bootstrap/lib/tabbedarea');
var TabPane = require('react-bootstrap/lib/tabpane');
var DatasetList = require('./dataset-list');
var DatasetVisualization = require('./dataset-visualization');
var ProjectDataEntry = require('./project-data-entry');

const VIS_TABS = {
  team: {
    name: 'Visualize Team',
    eventKey: 'visualizeTeam'
  },
  class: {
    name: 'Visualize Class',
    eventKey: 'visualizeClass'
  },
  teacher: {
    name: 'Visualize Teacher',
    eventKey: 'visualizeTeacher'
  },
  state: {
    name: 'Visualize State',
    eventKey: 'visualizeState'
  },
  all: {
    name: 'Visualize All States',
    eventKey: 'visualizeAllStates'
  }
};

var DatasetArea = React.createClass({
  getInitialState: function() {
    return {
      openedTabs: {}
    };
  },
  
  handleTabSelect: function (key) {
    this.props.onSelect(key);
    // I'd like to set a property on the DatasetVisualization view
    // so it knows it has been selected for the first time I think
    // the only way to do that is to set some state on ourselves
    // which is passed down to the DatsetVisualization
    this.state.openedTabs[key] = true;
    this.setState({openedTabs: this.state.openedTabs});
  },

  getDatasetList: function (type) {
    if (this.props.filteredDatasets === 'disabled') {
      // Special case, datasets are disabled. DatasetVisualization handles this value too.
      return 'disabled';
    }
    if (this.props.filteredDatasets === 'refreshing') {
      // Special case, datasets are refreshing. DatasetVisualization handles this value too.
      return 'refreshing';
    }
    if (type === 'all') {
      // Another special case. Filtering doesn't provid all the datasets, as it's not necessary.
      // Also, we can't list all the IDs, as URL would get too long. If we don't provide anything, the effect is the same.
      return '';
    }
    return this.props.filteredDatasets && this.props.filteredDatasets[type];
  },

  renderVisualizeTab: function (type) {
    var tabInfo = VIS_TABS[type];
    return (
      <TabPane key={type} eventKey={tabInfo.eventKey} tab={tabInfo.name}>
        <DatasetVisualization
          datasetList={this.getDatasetList(type)}
          project={this.props.project}
          classPeriod={this.props.classPeriod}
          team={this.props.team}
          opened={this.state.openedTabs[tabInfo.eventKey]}/>
      </TabPane>
    );
  },

  render: function() {
    var addDatasetTab =
      <TabPane key='add' eventKey='add' tab='Add Dataset'>
        <ProjectDataEntry
          project={this.props.project}
          classPeriod={this.props.classPeriod}
          team={this.props.team}
          progress={this.props.submissionProgress}/>
      </TabPane>;
    var listDatasetsTab =
      <TabPane key='list' eventKey='list' tab='List Datasets'>
        <DatasetList
          project={this.props.project}
          datasets={this.props.datasets}
          classPeriod={this.props.classPeriod}/>
      </TabPane>;

    var tabs = [addDatasetTab, listDatasetsTab];
    // if we are embedded then add a new tab for visualize
    if (window.EMBEDDED) {
      var visTabs = Object.keys(VIS_TABS).map(function (type) { return this.renderVisualizeTab(type); }.bind(this));
      tabs = [addDatasetTab].concat(visTabs);
    }

    return (
      <TabbedArea activeKey={this.props.tabKey} onSelect={this.handleTabSelect}>
        { tabs }
      </TabbedArea>
    );
  }
});

module.exports = DatasetArea;
