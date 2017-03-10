const cp = require('child_process');

function Worker()
{
    
    var self = this;

    var workerFree = false;
    var worker = cp.fork(`${__dirname}/child.js`);

    // Parent got a message
    worker.on('message', (msg) => {
        if(!msg.type) {
            console.error("Error in message from child process:  no message type specified.");
        }
        
        switch(msg.type) {
            case 'INIT_COMPLETE':
                console.log("Worker process (GT.M PID", msg.data.gtm_pid + ")", "is now ready")
                workerFree = true;
                break;


        }
    });

    return this;
}

Worker.prototype.dispatch = function(command, callback) {

}

Worker.prototype.free = function () {
    return workerFree;
}

module.exports.Worker = Worker;