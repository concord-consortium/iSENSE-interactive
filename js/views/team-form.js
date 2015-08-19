var React = require('react');
var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/input');

var TeamForm = React.createClass({
  getInitialState: function() {
  	return {
      team: ""
    };
  },

  handleChange: function(e) {
  	this.setState({team: e.target.value});
  },

  handleSet: function(e) {
  	this.props.onChange(this.state.team);
  },

  render: function() {
  	var setTeamButton = <Button onClick={this.handleSet}>Set Team</Button>;

  	return (
  	  <Input
        type="text"
  	  	placeholder="enter team name"
        value={this.state.name}
        buttonAfter={setTeamButton}
        onChange={this.handleChange}
        help={["No team? Enter ", <i>demo</i>, "."]}
  	  />
    );
  }
});

module.exports = TeamForm;