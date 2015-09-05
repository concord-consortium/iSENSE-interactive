var React = require('react');
var App = require('./views/app');

window.fromBrowser = document.URL.match(/^https?:/)

if(window.EMBEDDED){
  window.projectNum = location.hash.slice(1);
}

// use of the ref with a call back is a hack to keep things simple
// it exposes the toplevel coponent as a global so other components can
// send it events
React.render(
  <App ref={function(component){ window.WS = component}}/>,
  document.getElementById('example')
);
