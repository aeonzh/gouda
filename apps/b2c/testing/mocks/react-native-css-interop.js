// Minimal shim: provide createInteropElement that delegates to React.createElement
const ReactImport = require('react');
const ReactCompat =
  ReactImport && ReactImport.default ? ReactImport.default : ReactImport;

function createInteropElement(type, props, ...children) {
  return ReactCompat.createElement(type, props, ...children);
}

module.exports = { __esModule: true, createInteropElement };
