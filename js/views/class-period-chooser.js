var ClassPeriodChooser = React.createClass({
  getInitialState: function() {
    return {
      addingNewClassPeriod: false
    };
  },

  addNewClassPeriod: function(e){
    e.preventDefault();
    this.setState({addingNewClassPeriod: true});
  },

  onClassPeriodChoosen: function(classPeriod) {
    this.setState({addingNewClassPeriod: false});
    this.props.onClassPeriodChoosen(classPeriod);
  },

  cancelAddNewClassPeriod: function(){
    this.props.onClassPeriodChoosen(null);
  },

  render: function() {
    var mainComponent;

    if(this.state.addingNewClassPeriod) {
      return (
        <div>
          <h2>Choose or add a class</h2>
          <ClassPeriodAddForm onClassPeriodChoosen={this.onClassPeriodChoosen}/>
        </div>
        );
    } else {
      return (
        <div>
          <h2>Choose or add a class</h2>
          <ClassPeriodChooserList
            classPeriods={this.props.classPeriods}
            onClassPeriodChoosen={this.props.onClassPeriodChoosen}/>
          <a href="enter_class_word" onClick={this.addNewClassPeriod}>Add New Class</a>
        </div>
      );
    }
  }
});

var ClassPeriodChooserList = React.createClass({
  render: function() {
    // need a list of projects to choose from
    var list = [];
    this.props.classPeriods.forEach(function(classPeriod){
      list.push(
        <li>
          <ClassPeriodChooserItem classPeriod={classPeriod} onSelect={this.props.onClassPeriodChoosen}/>
        </li>);
    }.bind(this));

    return (
      <ul>
        {list}
      </ul>
    );
  }
});

var ClassPeriodChooserItem = React.createClass({
  selectClassPeriod: function(e) {
    e.preventDefault();
    this.props.onSelect(this.props.classPeriod);
  },

  render: function() {
    var classPeriodURL = this.props.classPeriod.uri;
    return (
      <a href={classPeriodURL}
         onClick={this.selectClassPeriod}
      >
        {this.props.classPeriod.name}
      </a>
    );
  }
});

