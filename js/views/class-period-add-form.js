var ClassPeriodAddForm = React.createClass({
  getInitialState: function() {
  	return {
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

  cancelSelectClassHandler: function (e) {
  	e.preventDefault();
  	this.setState({foundClassPeriod: null});
  	this.props.onClassPeriodChoosen(null);
  },

  render: function() {
  	if (this.state.foundClassPeriod === null) {
	    return (
		  	<form>
		  	  <input
		  	    type="text"
		  	    placeholder="enter class word"
		  	    ref="classwordInput"
		  	  />
		  	  <input
		  	    type="submit"
		  	    value="Find Class"
		  	    onClick={this.findClassHandler}
		  	    />
		  	</form>
	    );
    } else {
    	return (
    		<div>
    		  <p>Is the class you were looking for?</p>
    		  <ClassPeriodView classPeriod={this.state.foundClassPeriod}/>
    		  <input type="submit" value="Select Class" onClick={this.selectClassHandler}/>
    		  <input type="submit" value="Cancel" onClick={this.cancelSelectClassHandler}/>
    		</div>
    		);
    }
  }
});