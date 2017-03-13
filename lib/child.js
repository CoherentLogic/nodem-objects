const nodem = require('nodem');
const _ = require('underscore');

var current = {
    global: null,
    subscripts: []
};

var db = null;

const nodemAPI = {

    getObject: function (subscripts, outputStruct) {

        if(subscripts) {
            var mSubscripts = fastClone(subscripts);
        }
        else {
            var mSubscripts = fastClone(current.subscripts);
        }

        if(!outputStruct) {
            var outStruct = {};
        }
        else {
            var outStruct = fastClone(outputStruct);
        }

        console.log(mSubscripts);

        var lastResult = false;
        
        mSubscripts.push("");

        while(!lastResult) {

            var order = db.order({global: current.global, subscripts: mSubscripts});
            
            if(!order.ok) {
                throw("NodeM error calling order()");
            }

            if(order.result === "") {
                lastResult = true;
                
                continue;
            }

            mSubscripts = order.subscripts;
            
            var structSubs = mSubscripts.slice(current.subscripts.length);
            var data = db.data({global: current.global, subscripts: mSubscripts});

            switch(data.defined) {
            case 11:
                var nodeValue = db.get({global: current.global, subscripts: mSubscripts});

                if(!nodeValue.ok) {
                    throw("NodeM error calling get()");
                }

                buildObject(outStruct, structSubs, nodeValue.data, true);
                _.extend(outStruct, nodemAPI.getObject(mSubscripts, outStruct));
                break;
            case 10:
                _.extend(outStruct, nodemAPI.getObject(mSubscripts, outStruct))
                break;
            case 1:
                buildObject(outStruct, structSubs, db.get({global: current.global, subscripts: mSubscripts}).data, false);
                break;
            }

        }

        return outStruct;   
    },

    setObject: function (inputObject, subscripts) {
    
        if(subscripts) {
            var subs = fastClone(subscripts);
        }
        else {
            var subs = fastClone(this.subscripts);
        }

        for(var key in inputObject) {

            subs.push(key);
            
            switch(typeof inputObject[key]) {
                case 'object':
                    this.set(inputObject[key], subs);
                    break;
                case 'string':
                case 'number':                
                    var result = this.db.set({global: this.global, subscripts: subs, data: inputObject[key]});
                    if(!result.ok) {
                        throw("NodeM error calling set()");
                    }
                    break;
            }

            subs.pop();
        }

        return;
    },

    get: function (opts) {
        return db.get({global: current.global, subscripts: current.subscripts});
    },

    set: function (opts) {

    },

    kill: function (opts) {

    },

    lock: function (opts) {

    },

    unlock: function (opts) {

    },

    data: function (opts) {

    },

    order: function (opts) {

    },

    query: function (opts) {

    },

    callFunction: function (opts) {

    },

    callProcedure: function (opts) {

    }

};

function fastClone(obj)
{
    return JSON.parse(JSON.stringify(obj));
}

function isNumeric(n)
{
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function buildObject(obj, keyArray, value, lastKeyEmpty)
{
    if(lastKeyEmpty) {
       keyArray.push("");
    }
    
    lastKeyIndex = keyArray.length - 1;

    for(var i = 0; i < lastKeyIndex; ++ i) {
        
        key = keyArray[i];
        
        if (!(key in obj)) {
           obj[key] = {};
        }
        
        obj = obj[key];
    }

    obj[keyArray[lastKeyIndex]] = value;    
}

function handleMessage(msg)
{
    if(!msg.options) {
        throw("Invalid message sent to worker process.");
    }

    current.global = msg.options.global || null;
    current.subscripts = msg.options.subscripts || [];

    var result = nodemAPI[msg.action](msg.options);

    sendMessage('COMMAND_COMPLETE', result);
}

function sendMessage(type, data)
{
    var msg = {
        type: type,
        data: data
    };

    process.send(msg);
}

process.on('message', handleMessage);

db = new nodem.Gtm();

var result = db.open();

if(!result.ok) {
    sendMessage('INIT_ERROR', {message: "Error opening GT.M"});
}

var gtm_pid = result.gtm_pid;

sendMessage('INIT_COMPLETE', {gtm_pid: gtm_pid});