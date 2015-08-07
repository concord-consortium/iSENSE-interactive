var React = require('react');
var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/input');

var ClassPeriodView = require('./class-period-view');
var ClassPeriod = require('../models/class-period');

var ClassPeriodAddForm = React.createClass({
  getInitialState: function() {
  	return {
      classword: "",
      foundClassPeriod: null
    };
  },

  findClassHandler: function (e) {
  	e.preventDefault();
  	this.setState({
  		foundClassPeriod: 	new ClassPeriod({
			"uri": "https://itsi.portal.concord.org/classes/3",
			"name": "Period 3",
			"state": "TX",
			"teachers": [
			   {
			   	  "id": "https://itsi.portal.concord.org/users/3",
			   	  "first_name": "Allison",
			   	  "last_name": "Smith"
			   	}
			],
    	})
  	});
  	// send the class word to the portal and get back the class info
  	// for now we can just load some mock data regardless of the classword
  	// after we have the info we should display it so the user can confirm
  	// this is the class they want to add
  },

  selectClassHandler: function (e) {
  	e.preventDefault();
  	this.props.onClassPeriodChoosen(this.state.foundClassPeriod);
  	this.setState({foundClassPeriod: null});
  },

  handleChange: function(event) {
    this.setState({classword: event.target.value});
  },

  render: function() {
    var foundClassPeriodConfirmation = false;

    if (this.state.foundClassPeriod !== null) {
      foundClassPeriodConfirmation =
        <div>
          <ClassPeriodView classPeriod={this.state.foundClassPeriod}/>
          <Button onClick={this.selectClassHandler}>Select Class</Button>
        </div>
    }

    var foundClassPeriodSummary = "";
    if(this.state.foundClassPeriod !== null) {
      foundClassPeriodSummary = this.state.foundClassPeriod.summaryText();
    }

    var findClassButton = <Button type="submit" onClick={this.findClassHandler}>Find</Button>;
    var selectClassButton =
      <Button
          disabled={this.state.foundClassPeriod === null}
          onClick={this.selectClassHandler}>
        Select</Button>;


    return (
      <div>
  	  	<form>
          <Input
            type="text"
            label="Find New Class"
  	  	    placeholder="enter class word"
            value={this.state.classword}
            buttonAfter={findClassButton}
            onChange={this.handleChange}
  	  	  />
  	  	</form>
        <Input
          type="text"
          placeholder="result"
          value={foundClassPeriodSummary}
          buttonAfter={selectClassButton}
          readOnly
          disabled={this.state.foundClassPeriod === null}
          />
      </div>
    );
  }
});

module.exports = ClassPeriodAddForm;
