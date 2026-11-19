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
  * @typedef {Object} SyncType_PlayerAdded
  * @property {"PLAYER_ADDED"} type
  * @property {string} id
  */
 
/**
  * @typedef {Object} SyncType_InvokeOtherPlayers
  * @property {"INVOKE_OTHERS"} type
  */
 
 /**
  * @typedef {Object} SyncTypeData
  * @property {SyncType_PlayerUpdate} PLAYER_UPDATE
  * @property {SyncType_PlayerAdded} PLAYER_ADDED
  * @property {SyncType_InvokeOtherPlayers} INVOKE_OTHERS
  */

//~ Constants

const peer = new Peer();

const dataRecievedCallbacks = {};
const playerAddedCallbacks = {};

const connectedPeers = {}

//~ Variables

/**
 * @type {string?}
 */
let clientId = null;

//~ Helper Functions

function initPlayer(conn) {
    if (connectedPeers[conn.peer]) return;
    
    console.log(`Initializing other player with id ${conn.peer}.`);

    connectedPeers[conn.peer] = conn;
    
    Object.keys(playerAddedCallbacks).forEach(key => {
        playerAddedCallbacks[key](conn.peer);
    });

    conn.on('data', (data) => {
        if (data.type == Enum.SyncType.PlayerAdded) {            
            let conn = peer.connect(data.id)

            conn.on('open', () => {
                initPlayer(conn);
            });

            return;
        }

        if (data.type == Enum.SyncType.InvokeOtherPlayers) {
            Object.keys(connectedPeers).forEach(id => {
                if (id == conn.peer) return;
                console.log(`Sending other peer id to ${conn.peer}, with id ${id}.`)
                sendData(Enum.SyncType.PlayerAdded, { id: id }, conn);
            });

            return;
        }

        Object.keys(dataRecievedCallbacks).forEach(key => {
            dataRecievedCallbacks[key](data);
        });
    });

    sendData(Enum.SyncType.InvokeOtherPlayers, {}, conn);
}

//~ Main

peer.on('open', (id) => {
    console.log('My peer ID is: ' + id);
    document.getElementById('my-id').innerText = id;
    clientId = id;
});

peer.on('connection', (conn) => {
    console.log('A player connected to us!');
    initPlayer(conn);
});

document.getElementById('connect-btn').addEventListener('click', () => {
    const friendId = document.getElementById('friend-id-input').value.trim();
    if (!friendId) {
        alert('Please paste a Peer ID first!');
        return;
    }

    console.log('Connecting to:', friendId);

    let conn = peer.connect(friendId);
    conn.on('open', () => {
        console.log('Successfully connected to the host!');
        alert('Connected successfully!');
        
        initPlayer(conn);
    });
});

//~ Public API

/**
 * @template {keyof SyncTypeData} T
 * @param {T} type
 * @param {SyncTypeData[T]} data
 * @param {any?} conn
 * @returns {void}
 */
export function sendData(type, data, conn) {
    data.type = type;
    if (conn) conn.send(data);
    else {
        Object.keys(connectedPeers).forEach(id => {
            let conn = connectedPeers[id]
            conn.send(data);
        });
    }    
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