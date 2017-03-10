var nodemObjects = require('../lib/nodem-objects');
var obj = new nodemObjects.Obj({global: "KBBMTEST", subscripts: []});

process.on('uncaughtException', function(err) {
    console.error(err);
    obj.close();
    process.exit(1);
});

var result = obj.get();

console.log("get result = ", JSON.stringify(result, null, 2));

var setObj = new nodemObjects.Obj({global: "KBBMTEST", subscripts: ["setTest"]});

setObj.set(result);

obj.close();
