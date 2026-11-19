//~ Imports

import Peer from 'peerjs';
import { Enum } from './enums.js';

//~ Types

 /**
  * @typedef {Object} SyncType_PlayerUpdate
  * @property {"PLAYER_UPDATE"} type
  * @property {string} id
  * @property {number} x
  * @property {number} y
  * @property {number} z
  * @property {number} rotation
  */
 
 /**
  * @typedef {Object} SyncTypeData
  * @property {SyncType_PlayerUpdate} PLAYER_UPDATE
  */

//~ Constants

const peer = new Peer();
const dataRecievedCallbacks = {};
const playerAddedCallbacks = {};

//~ Variables

let conn = null;

/**
 * @type {string?}
 */
let clientId = null;

//~ Main

peer.on('open', (id) => {
    console.log('My peer ID is: ' + id);
    document.getElementById('my-id').innerText = id;
    clientId = id;
});

peer.on('connection', (incomingConn) => {
    conn = incomingConn;
    console.log('A player connected to us!');
    console.log(conn.id);

    Object.keys(playerAddedCallbacks).forEach(key => {
        playerAddedCallbacks[key](conn.id);
    });
    
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
 * @template {keyof SyncTypeData} T
 * @param {T} type
 * @param {SyncTypeData[T]} data
 * @returns {void}
 */
export function sendData(type, data) {
    if (!conn || !conn.open) return;
    data.type = type;
    conn.send(data);
}

/**
 * @template {string} K
 * @param {(id: string) => (void)} callback 
 * @param {K} name 
 * @returns {K}
 */
export function onPlayerAdded(callback, name) {
    playerAddedCallbacks[name] = callback;
    return name;
}

/**
 * @template {keyof SyncTypeData} T
 * @template {string} K
 * @param {T} type
 * @param {(data: SyncTypeData[T]) => (void)} callback 
 * @param {K} name 
 * @returns {K}
 */
export function onDataRecieved(type, callback, name) {
    dataRecievedCallbacks[name] = (data) => {
        if (data && data.type === type) {
            callback(data);
        }
    };
    return name;
}

/**
 * @returns {string?}
 */
export function getClientId() {
    return clientId;
}