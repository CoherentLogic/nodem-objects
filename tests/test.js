var nodemObjects = require('./lib/nodem-objects');
var obj = new nodemObjects.Obj({global: "VA", subscripts: [200,1]});

console.log(obj.get());
