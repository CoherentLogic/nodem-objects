const cp = require('child_process');

function Worker()
{
    
    var self = this;

    this.callback = null;

    this.workerFree = false;
    this.worker = cp.fork(`${__dirname}/child.js`);

    // Parent got a message
    this.worker.on('message', (msg) => {
        if(!msg.type) {
            console.error("Error in message from child process:  no message type specified.");
        }
        
        switch(msg.type) {
            case 'INIT_COMPLETE':                
                this.workerFree = true;
                break;   
            case 'COMMAND_COMPLETE':
                this.callback(!msg.data.ok, msg.data.data);
                this.workerFree = true;
                break;         
        }
    });

    return this;
}

Worker.prototype.dispatch = function(action, options, callback) {
    this.reserve();

    this.callback = callback;

    this.worker.send({action: action,
                      options: options});
}

Worker.prototype.free = function () {
    return this.workerFree;
}

Worker.prototype.reserve = function () {
    this.workerFree = false;

    return this;
}

module.exports.Worker = Worker;