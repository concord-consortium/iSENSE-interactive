var TeamInfo = React.createClass({
  getInitialState: function() {
  	return {
      changing: false
    };
  },

  changeTeamRequest: function(e) {
  	e.preventDefault();
  	this.setState({changing: true});
  },

  changeTeamHandler: function(e) {
  	e.preventDefault();
  	this.props.onChange({name: this.refs.teamNameInput.getDOMNode().value})
  	this.setState({changing: false});
  },

  render: function() {
	if (this.state.changing){
	  return (
	  	<form>
	  	  <input
	  	    type="text"
	  	    placeholder="enter team name"
	  	    defaultValue={this.props.team.name}
	  	    ref="teamNameInput"
	  	  />
	  	  <input
	  	    type="submit"
	  	    value="Set Team"
	  	    onClick={this.changeTeamHandler}
	  	    />
	  	</form>
	  );
	} else {
	  return (
	    <div>Team: {this.props.team.name}
	         <a href="change_team" onClick={this.changeTeamRequest}>change</a>
	    </div>
	  );
    }
  }
});