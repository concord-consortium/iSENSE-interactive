var React = require('react');
var App = require('./views/app');

// use of the ref with a call back is a hack to keep things simple
React.render(
  <App ref={function(component){ window.WS = component}}/>,
  document.getElementById('example')
);