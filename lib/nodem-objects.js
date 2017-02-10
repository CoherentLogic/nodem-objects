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

function fastClone(obj)
{
    return JSON.parse(JSON.stringify(obj));
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
        mSubscripts = FastClone(subscripts);
    }
    else {
        mSubscripts = FastClone(this.subscripts);
    }

    if(!outputStruct) {
        outStruct = {};
    }
    else {
        outStruct = FastClone(outputStruct);
    }

    var lastResult = false;
    mSubscripts.push("");

    while(!lastResult) {
        var order = this.db.next_node({global: this.global, subscripts: mSubscripts});
        var lastResult = order.defined;

        if(lastResult) {
            continue;
        }

        mSubscripts.splice(-1, 1);
        mSubscripts.push(order.data);

        
    
    
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
