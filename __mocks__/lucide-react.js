const React = require('react');
const handler = () => () => React.createElement('span');
module.exports = new Proxy({}, {
  get: () => handler,
});