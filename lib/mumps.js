/*
 * MUMPS API
 * 
 * mumps.js: implementation of the API
 *
 * 
 * Copyright (C) 2017 Coherent Logic Development LLC
 * 
 * Author: John P. Willis <jpw@coherent-logic.com>
 *
 */

const worker = require('./worker');

function MUMPS(opts)
{
    this.workers = [];

    for(i = 0; i < 10; i++) {
        this.workers.push(new worker.Worker());
    }

    return this;
}

MUMPS.prototype.getObject = function(global, subscripts, callback) {

}

MUMPS.prototype.setObject = function(global, subscripts, data, callback) {

}

MUMPS.prototype.get = function(global, subscripts, callback) {

}

MUMPS.prototype.set = function(global, subscripts, data, callback) {

}

MUMPS.prototype.kill = function(global, subscripts, callback) {

}

MUMPS.prototype.lock = function(global, subscripts, timeout, callback) {

}

MUMPS.prototype.unlock = function(global, subscripts, callback) {

}

MUMPS.prototype.data = function(global, subscripts, callback) {

}

MUMPS.prototype.order = function(global, subscripts, callback) {

}

MUMPS.prototype.query = function(glRef, callback) {

}

MUMPS.prototype.callFunction = function(func, args, callback) {

}

MUMPS.prototype.callProcedure = function(proc, args, callback) {

}

module.exports.MUMPS = MUMPS;

