var DatasetArea = React.createClass({
  getInitialState: function() {
    return { mode: "addingData" };
  },

  handleAddData: function(e) {
    e.preventDefault();
    this.setState({mode: "addingData"});
  },

  handleViewData: function(e) {
    e.preventDefault();
    this.setState({mode: "viewingData"});
  },

  render: function() {
    var content;

    switch(this.state.mode) {
      case "addingData":
        content = (
          <ProjectDataEntry project={this.props.project}/>
        );
        break;
      case "viewingData":
        content = (
          <DatasetList
            project={this.props.project}
            datasets={this.props.datasets}
            classPeriod={this.props.classPeriod}/>
        );
        break;
    }

    return (
      <div>
        <div>
          <a href="add_data" onClick={this.handleAddData}>Add Dataset</a>
          {" "}
          <a href="view_data" onClick={this.handleViewData}>List Datasets</a>
        </div>
        {content}
      </div>
      );
  }
});
