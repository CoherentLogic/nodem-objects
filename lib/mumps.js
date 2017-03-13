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
    var self = this;

    if(opts) {
        var workerCount = opts.workerCount || 10;
    }
    else {
        var workerCount = 10;
    }

    this.workers = [];

    for(i = 0; i < workerCount; i++) {
        this.workers.push(new worker.Worker());
    }

    return this;
}

MUMPS.prototype.nextFreeWorker = function () {
    for(var index in this.workers) {
        if(this.workers[index].free()) {
            return this.workers[index].reserve();
        }
    }

    // no free worker found... create a new one
    this.workers.push(new worker.Worker());

    return this.nextFreeWorker();
}

MUMPS.prototype.dispatch = function (action, opts, callback) {
    var w = this.nextFreeWorker();

    return w.dispatch(action, opts, callback);
}

MUMPS.prototype.getObject = function(global, subscripts, callback) {
    this.dispatch('getObject', {global: global, subscripts: subscripts}, callback);
}

MUMPS.prototype.setObject = function(global, subscripts, data, callback) {
    this.dispatch('setObject', {global: global, subscripts: subscripts, data: data}, callback);
}

MUMPS.prototype.get = function(global, subscripts, callback) {
    this.dispatch('get', {global: global, subscripts: subscripts}, callback);
}

MUMPS.prototype.set = function(global, subscripts, data, callback) {
    this.dispatch('set', {global: global, subscripts: subscripts, data: data}, callback);
}

MUMPS.prototype.kill = function(global, subscripts, callback) {
    this.dispatch('kill', {global: global, subscripts: subscripts}, callback);
}

MUMPS.prototype.lock = function(global, subscripts, timeout, callback) {
    this.dispatch('lock', {global: global, subscripts: subscripts, timeout: timeout}, callback);
}

MUMPS.prototype.unlock = function(global, subscripts, callback) {
    this.dispatch('unlock', {global: global, subscripts: subscripts}, callback);
}

MUMPS.prototype.data = function(global, subscripts, callback) {
    this.dispatch('data', {global: global, subscripts: subscripts}, callback);
}

MUMPS.prototype.order = function(global, subscripts, callback) {
    this.dispatch('order', {global: global, subscripts: subscripts}, callback);
}

MUMPS.prototype.query = function(glRef, callback) {
    this.dispatch('query', {glRef: glRef}, callback);
}

MUMPS.prototype.callFunction = function(func, args, callback) {
    this.dispatch('callFunction', {func: func, args: args}, callback);
}

MUMPS.prototype.callProcedure = function(proc, args, callback) {
    this.dispatch('callProcedure', {proc: proc, args: args}, callback);
}

module.exports.MUMPS = MUMPS;

