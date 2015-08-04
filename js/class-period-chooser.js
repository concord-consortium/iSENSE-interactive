var ClassPeriodChooser = React.createClass({
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
	  	<div>
		  	<h2>Choose a class or add a new class</h2>
		  	<ul>
		  	  {list}
		  	</ul>
		  </div>
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