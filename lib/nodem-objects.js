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
    lastKeyIndex = keyArray.length - 1;
    for(var i = 0; i < lastKeyIndex; ++ i) {
	key = keyArray[i];
	if (!(key in obj)) {
	    obj[key] = {};
	}
	obj = obj[key];
    }

    if(lastKeyEmpty) {
	obj[keyArray[lastKeyIndex]][''] = value;
    }
    else {
	obj[keyArray[lastKeyIndex]] = value;
    }
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

    try {
        this.db.open();
    }
    catch(ex) {

    }
    
    return this;
}

Obj.prototype.get = function (subscripts, outputStruct) {

    
    if(subscripts) {
//	console.log("WE HAVE RECURSED!!!");
        mSubscripts = fastClone(subscripts);
//	console.log("mSubscripts: ", mSubscripts);
//	console.log("outputStruct: ", outputStruct);5
    }
    else {
        mSubscripts = fastClone(this.subscripts);
    }

    if(!outputStruct) {
        outStruct = {};
    }
    else {
        outStruct = fastClone(outputStruct);
    }

    var lastResult = false;
    mSubscripts.push("");

    while(!lastResult) {

//	console.log("***");
	
        var order = this.db.order({global: this.global, subscripts: mSubscripts});

//	console.log("ORDER: ", order);
	
	if(order.result === "") {
	    lastResult = true;
	    continue;
	}

	mSubscripts = order.subscripts;
//        mSubscripts.splice(-1, 1);
//        mSubscripts.push(order.result);

//	console.log("this.subscripts = ", this.subscripts);
//	console.log("post-splice and push mSubscripts = ", mSubscripts);
	
	var structSubs = mSubscripts.slice(this.subscripts.length);

//	console.log("structSubs (sliced mSubscripts) = ", structSubs, typeof mSubscripts);
	
	var data = this.db.data({global: this.global, subscripts: mSubscripts});

//	console.log("initial structSubs: ", structSubs);
//	console.log("initial outStruct: ", outStruct);
//	console.log("data: ", data);
	
	switch(data.defined) {
	case 11:
//	    console.log("data and children");
	    buildObject(outStruct, structSubs, this.db.get({global: this.global, subscripts: mSubscripts}).data, true);
	    outStruct = _.clone(outStruct, this.get(mSubscripts, outStruct));	    
	    break;
	case 10:
//	    console.log("subscripts only");
	    outStruct = _.clone(outStruct, this.get(mSubscripts, outStruct));
	    break;
	case 1:
//	    console.log("data only");
	    buildObject(outStruct, structSubs, this.db.get({global: this.global, subscripts: mSubscripts}).data, false);
	    break;
	}

//	console.log("outstruct = ", outStruct, " mSubscripts = ", mSubscripts);

    }

    return outStruct;	
};

Obj.prototype.set = function (inputObject) {

};

Obj.prototype.delete = function (value) {
    this.db.kill({global: this.global, subscripts: this.subscripts});

    return this;
};

Obj.prototype.lock = function (timeout) {

    if(!timeout) {
        timeout = 0;
    }
    
    this.db.lock({global: this.global, subscripts: this.subscripts, timeout: timeout});

    return this;
};

Obj.prototype.unlock = function () {

    this.db.unlock({global: this.global, subscripts: this.subscripts});
    
};


module.exports.Obj = Obj;
