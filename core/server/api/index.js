/**
 * Created by lihe on 2/19/16.
 */

function init(socket) {

    socket.on('message', function () {
        console.log('hello');
    })
}

module.exports = init;
