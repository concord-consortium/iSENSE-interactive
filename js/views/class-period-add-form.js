var React = require('react');
var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/input');

var ClassPeriodView = require('./class-period-view');
var ClassPeriod = require('../models/class-period');

var ClassPeriodAddForm = React.createClass({
  getInitialState: function() {
  	return {
      classword: "",
      foundClassPeriod: null,
      loadingClassInfo: false,
      errorLoadingClassInfo: null
    };
  },

  findClassHandler: function (e) {
  	e.preventDefault();
    this.setState({ loadingClassInfo: true, errorLoadingClassInfo: null, foundClassPeriod: null});
    var self = this;
    var oReq = new XMLHttpRequest();

    oReq.onload = function(){
      if (this.status === 404){
        self.setState({loadingClassInfo: false,
          errorLoadingClassInfo: "No class with this classword"});
        return;
      }
      if(this.status !== 200){
        self.setState({loadingClassInfo: false,
          errorLoadingClassInfo: "Unknown error while looking for class"});
        return;
      }

      var data = JSON.parse(this.responseText);
      var classPeriod = new ClassPeriod(data);
      self.setState({foundClassPeriod: classPeriod, loadingClassInfo: false});
    };
    oReq.onerror = function () {
      self.setState({loadingClassInfo: false,
        errorLoadingClassInfo: "Unknown error while looking for class"});
    };

    oReq.onabort = function () {
      self.setState({loadingClassInfo: false,
        errorLoadingClassInfo: "Aborted class lookup"});
    };

    // need to URL enccode this
    var encodedClassword = encodeURIComponent(this.state.classword);
    oReq.open("get",
      'https://waterscience-isense.concord.org/classes/info?class_word=' + encodedClassword,
      // 'https://itsi.portal.concord.org/portal/classes/info?class_word=' + encodedClassword,
      true);
    oReq.send();

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

    var resultText = "";
    var resultStyle = false;
    if(this.state.foundClassPeriod !== null) {
      resultText = this.state.foundClassPeriod.summaryText();
      resultStyle = 'success';
    } else if(this.state.errorLoadingClassInfo !== null){
      resultStyle = 'error'
      resultText = this.state.errorLoadingClassInfo;
    } else if(this.state.loadingClassInfo) {
      resultText = "Loading...";
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
          bsStyle={resultStyle}
          placeholder="result"
          value={resultText}
          buttonAfter={selectClassButton}
          readOnly
          disabled={this.state.foundClassPeriod === null}
          />
      </div>
    );
  }
});

module.exports = ClassPeriodAddForm;
