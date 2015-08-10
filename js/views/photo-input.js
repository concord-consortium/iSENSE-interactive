var React = require('react');

var Input = require('react-bootstrap/lib/input');
var Button = require('react-bootstrap/lib/Button');
var FormControls = require('react-bootstrap/lib/FormControls');

var PhotoInput = React.createClass({
  getInitialState: function() {
  	return {};
  },

  handlePhotoCapture: function(imageURI) {
  	this.props.onPhotoSelected(imageURI);

  	// it would also be nice to show them a thumbnail of the photo
  	// or some indication that a photo is selected
  	this.setState({photoSelected: true});

    // do something with this thing!!
    // need to pass it on to dataset
    // ideally it would be in a generic form that the
    // dataset could just post it with
    // however we don't really want to load the gigantic file into memory
    // and I don't trust the cross platformness of the File api -> cordova
    // integration.
    // So I think we'll need to paths in the dataset
    // one that takes the imageURI and uploads the form that way.
    // the other that uses the File object from the input type="File"
                     //     window.resolveLocalFileSystemURL(row.IMAGEURI, function(fileEntry) {
                     //   try {
                     //     var options = new FileUploadOptions();
                     //     options.fileKey = "upload";
                     //     options.chunkedMode = false;
                     //     options.fileName = row.IMAGEURI.substr(row.IMAGEURI.lastIndexOf('/') + 1);
                     //  options.mimeType = "image/jpeg";
                     //     options.params = {
                     //       "contribution_key": waterScience.context.contribution_key,
                     //       "contributor_name": waterScience.context.contributor_name,
                     //       "type": "data_set",
                     //       "id": data.id.toString()
                     //     };
                     //     options.headers = {Connection: "Close"};
                     //     var ft = new FileTransfer();
                     //     ft.upload(fileEntry.toInternalURL(), encodeURI("http://isenseproject.org/api/v1/media_objects/")
                     //                   , function(r) {toast("Uploaded");}
                     //                   , function(error) {toast("Upload Fail -> " + error.code + " " + error.source);}
                     //                   , options);
                     //   } catch(err) {toast(err.message);}
                     // }, function (e) {
                     //   toast ("File Error - " + e.message);
                     // }

  },

  capturePhoto: function(){
    navigator.camera.getPicture(this.handlePhotoCapture, function(message) {
	  console.log('Failed to get a picture');
	}, { quality: 40,
         destinationType: Camera.DestinationType.FILE_URI });

  },

  render: function(){
    if('camera' in navigator){
      // do Cordova photo capture
      var cameraButton =
        <div>
          <Button onClick={this.capturePhoto}>Add Photo</Button>
          { this.state.photoSelected ? " Photo Selected" : ""}
        </div>;

      return (
      	<FormControls.Static
      	  label="Photo"
      	  labelClassName="col-xs-2"
      	  wrapperClassName="col-xs-10">
      	  <Button onClick={this.capturePhoto}>Add Photo</Button>
          { this.state.photoSelected ? " Photo Selected" : ""}
      	</FormControls.Static>
      	);
    } else {
      // do browser photo capture
      return (
        <Input
          type='file'
          label='Photo'
          labelClassName='col-xs-2'
          wrapperClassName='col-xs-10'
          accept="image/*"/>
          );
    }
  }
})

module.exports = PhotoInput;
