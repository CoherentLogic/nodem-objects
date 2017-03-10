/*
 * NodeM Objects API
 * 
 * nodem-objects.js: implementation of the API
 *
 * 
 * Copyright (C) 2017 Coherent Logic Development LLC
 * 
 * Author: John P. Willis <jpw@coherent-logic.com>
 *
 */

var nodem = require('nodem');
var _ = require('underscore');

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

function Obj(opts)
{
    if(!opts) {
        throw("Must pass a valid options object to Obj constructor.");
    }

    if(!opts.global) {
        throw("Must supply a 'global' property in the Obj constructor options object.");
    }

    if(!opts.subscripts) {
        throw("Must supply a 'subscripts' array in the Obj constructor options object.");
    }

    this.global = opts.global;
    this.subscripts = opts.subscripts;

    if(opts.db) {
        this.db = opts.db;
    }
    else {
        this.db = new nodem.Gtm();
    }

    if(!this.db._isOpen) {
        var result = this.db.open();

        if(!result.ok) {
            throw("Error opening NodeM");
        }

        this.db._isOpen = true;
    }   
    
    return this;
}

Obj.prototype.get = function (subscripts, outputStruct) {

    if(subscripts) {
        var mSubscripts = fastClone(subscripts);
    }
    else {
        var mSubscripts = fastClone(this.subscripts);
    }

    if(!outputStruct) {
        var outStruct = {};
    }
    else {
        var outStruct = fastClone(outputStruct);
    }

    var lastResult = false;
    
    mSubscripts.push("");

    while(!lastResult) {

        var order = this.db.order({global: this.global, subscripts: mSubscripts});
        
        if(!order.ok) {
            throw("NodeM error calling order()");
        }

        if(order.result === "") {
            lastResult = true;
            
            continue;
        }

        mSubscripts = order.subscripts;
        
        var structSubs = mSubscripts.slice(this.subscripts.length);
        var data = this.db.data({global: this.global, subscripts: mSubscripts});

        switch(data.defined) {
        case 11:
            var nodeValue = this.db.get({global: this.global, subscripts: mSubscripts});

            if(!nodeValue.ok) {
                throw("NodeM error calling get()");
            }

            buildObject(outStruct, structSubs, nodeValue.data, true);
            _.extend(outStruct, this.get(mSubscripts, outStruct));
            break;
        case 10:
            _.extend(outStruct, this.get(mSubscripts, outStruct))
            break;
        case 1:
            buildObject(outStruct, structSubs, this.db.get({global: this.global, subscripts: mSubscripts}).data, false);
            break;
        }

    }

    return outStruct;   
};

Obj.prototype.set = function (inputObject, subscripts) {
    
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
};

Obj.prototype.delete = function () {
    var result = this.db.kill({global: this.global, subscripts: this.subscripts});

    if(!result.ok) {
        throw("NodeM error calling kill()");
    }

    return this;
};

Obj.prototype.lock = function (timeout) {

    if(!timeout) {
        timeout = 0;
    }
    
    var result = this.db.lock({global: this.global, subscripts: this.subscripts, timeout: timeout});

    if(!result.ok) {
        throw("Error acquiring lock");
    }

    return this;
};

Obj.prototype.unlock = function () {

    var result = this.db.unlock({global: this.global, subscripts: this.subscripts});
    
    if(!result.ok) {
        throw("Error releasing lock");
    }

    return this;
};

module.exports.Obj = Obj;
