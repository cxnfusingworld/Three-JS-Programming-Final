//~ Imports

import Peer from 'peerjs';

//~ Types

/**
 * @typedef {Object} Data
 * @property {string} type
 */

//~ Constants

const peer = new Peer();
const dataRecievedCallbacks = {};

//~ Variables

let conn = null;

//~ Main

peer.on('open', (id) => {
    console.log('My peer ID is: ' + id);
    document.getElementById('my-id').innerText = id;
});

peer.on('connection', (incomingConn) => {
    conn = incomingConn;
    console.log('A player connected to us!');
    initConnectionHandlers();
});

document.getElementById('connect-btn').addEventListener('click', () => {
    const friendId = document.getElementById('friend-id-input').value.trim();
    if (!friendId) {
        alert('Please paste a Peer ID first!');
        return;
    }

    console.log('Connecting to:', friendId);
    conn = peer.connect(friendId);
    
    conn.on('open', () => {
        console.log('Successfully connected to the host!');
        alert('Connected successfully!');
    });

    initConnectionHandlers();
});

function initConnectionHandlers() {
    conn.on('data', (data) => {
        Object.keys(dataRecievedCallbacks).forEach(key => {
            dataRecievedCallbacks[key](data);
        });
    });
}

//~ Public API

/**
 * @param {Data} data 
 */
export function sendData(data) {
    if (conn && conn.open) {
        conn.send(data);
    }
}

/**
 * @template K
 * @param {(data: Data) => (any)} callback 
 * @param {K & string} name 
 * @returns {K}
 */
export function onDataRecieved(callback, name) {
    dataRecievedCallbacks[name] = callback;
    return name;
}