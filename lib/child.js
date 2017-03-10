const nodem = require('nodem');

function handleMessage(msg)
{
    console.log(msg);
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

var db = new nodem.Gtm();

var result = db.open();

if(!result.ok) {
    sendMessage('INIT_ERROR', {message: "Error opening GT.M"});
}

var gtm_pid = result.gtm_pid;

sendMessage('INIT_COMPLETE', {gtm_pid: gtm_pid});