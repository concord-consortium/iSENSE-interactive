	// {
	// 	"uri": "https://itsi.portal.concord.org/classes/1",
	// 	"name": "Period 1",
	// 	"state": "MA",
	// 	"teachers": [
	// 	   {
	// 	   	  "id": "https://itsi.portal.concord.org/users/1",
	// 	   	  "first_name": "Scott",
	// 	   	  "last_name": "Cytacki"
	// 	   	}
	// 	],
	// 	"computed label_needs to be less than 40 chars": "ma-cytacki-period1"
	// },


var ClassPeriod = function(data){
  this.uri = data.uri;
  this.name = data.name;
  this.state = data.state;
  this.teachers = data.teachers;
  this.teacherName = data.teachers[0].last_name;
}

ClassPeriod.prototype.isenseLabel = function() {
  // this label can only be 40 characters so:
  // 2 separators between state and teacher and teacher and class
  // 2 State
  // 18 teacher
  // 18 class example "Science 101 Period 1" will be turned into "Science 101 Period"
  var teacherLastName = this.teacherName,
      className = this.name,
      label = "";

  if ((teacherLastName.length + className.length) > 36) {
    if(teacherLastName.length > 18 && className.length > 18) {
      // they are both long shorten them both to 18
      teacherLastName = shortenString(teacherLastName, 18);
      className = shortenString(className, 18);
    } else {
      if (teacherLastName.length > className.length) {
        teacherLastName = shortenString(teacherLastName, 36-className.length);
      } else {
        className = shortenString(className, 36-teacherLastName.length);
      }
    }
    // need to shorten one or both of the strings not sure the best approach here
  }
  label = this.state + '-' + teacherLastName + '-' + className;
  return label.toLowerCase();
}

ClassPeriod.prototype.contributorKey = function() {
  var key = this.uri;

  // need to shorten the key it can only be 40 chars
  // strip off http[s]://
  // strip 'concord.org'
  key = key.replace('.concord.org', '');
  key = key.replace('http://', '');
  key = key.replace('https://', '');
  return key;
}

module.exports = ClassPeriod;
