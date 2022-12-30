The idea is to have an editor UI with an editor service.  Hopefully the use of React and React-SVG
will simplify things.

Focusing on the editor front and backend, since a separate flow backend service will execute flows for different projects, managing separate processes, containers, or k8s pods.

Yet another backend service will handle users, accounts, etc..  The idea is that this will be a multi-tenant system...


References:

Layout
css layout - like an ide
https://codepen.io/adrifolio/pen/GvXVgP

Forms for config will be generated dynamically using JSON to see how far we can get with that.  Dynamically generating react forms for configuring nodes"
https://medium.com/swlh/how-to-generate-dynamic-form-from-json-with-react-5d70386bb38b

Use json-server for testing in test-server folder.

building SVG components in React
https://pganalyze.com/blog/building-svg-components-in-react

Drag and drop SVG components
https://stackoverflow.com/questions/53458053/how-to-handle-react-svg-drag-and-drop-with-react-hooks


Next steps
- decide on data structure for flows (similar to Node-RED or?)
- add connectors
- add registry service


