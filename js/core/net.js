//~ Imports

import Peer from 'peerjs';
import { Enum } from './enums.js';

//~ Types

/** 
  * @typedef {import('../core/effectRegistry.js').EffectPayloadMap} EffectPayloadMap 
  */

/**
 * @typedef {{
 *  type: Enum["SyncType"]["PlayerUpdate"],
 *  id: string,
 *  x: number,
 *  y: number,
 *  z: number,
 *  rotation: number,
 *  health: number?,
 * }} SyncType_PlayerUpdate
 */

/**
 * @typedef {{
 *  type: Enum["SyncType"]["PlayerAdded"],
 *  id: string,
 * }} SyncType_PlayerAdded
 */

/**
 * @typedef {{
 *  type: Enum["SyncType"]["InvokeOtherPlayers"],
 * }} SyncType_InvokeOtherPlayers
 */

/**
 * @typedef {{
 *   [K in keyof EffectPayloadMap]: {
 *     type: Enum["SyncType"]["SpawnEffect"],
 *     effectName: K,
 *     data: EffectPayloadMap[K]
 *   }
 * }[keyof EffectPayloadMap]} SyncType_SpawnEffect
 */

/**
 * @typedef {{
 *  type: Enum["SyncType"]["Damage"],
 *  damage: number,
 * }} SyncType_Damage
 */

/**
 * @typedef {{
 *  PLAYER_UPDATE: SyncType_PlayerUpdate,
 *  PLAYER_ADDED: SyncType_PlayerAdded,
 *  INVOKE_OTHERS: SyncType_InvokeOtherPlayers,
 *  SPAWN_EFFECT: SyncType_SpawnEffect
 *  DAMAGE: SyncType_Damage
 * }} SyncTypeData
 */

//~ Constants

const peer = new Peer();

const dataRecievedCallbacks = {};
const dataSendingCallbacks = {};
const playerAddedCallbacks = {};
const playerRemovedCallbacks = {};

const connectedPeers = {}

//~ Variables

/**
 * @type {string?}
 */
let clientId = null;

//~ Helper Functions

function initPlayer(conn) {
    if (connectedPeers[conn.peer] === conn) return;
    if (connectedPeers[conn.peer]) connectedPeers[conn.peer].close();

    console.log(`Initializing other player with id ${conn.peer}.`);

    connectedPeers[conn.peer] = conn;

    Object.keys(playerAddedCallbacks).forEach(key => {
        playerAddedCallbacks[key](conn.peer);
    });

    let handleDisconnect = () => {
        if (connectedPeers[conn.peer] === conn) {
            console.log(`Player disconnected: ${conn.peer}`);
            delete connectedPeers[conn.peer];

            Object.keys(playerRemovedCallbacks).forEach(key => {
                playerRemovedCallbacks[key](conn.peer);
            });
        }
    };

    let initConnections = () => {
        conn.on('data', (data) => {
            if (data.type == Enum.SyncType.PlayerAdded) {
                if (data.id === clientId || connectedPeers[data.id]) return;

                if (clientId < data.id) {
                    let newConn = peer.connect(data.id);
                    newConn.on('open', () => {
                        initPlayer(newConn);
                    });
                }

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

        conn.on('close', handleDisconnect);
        conn.on('error', handleDisconnect);

        sendData(Enum.SyncType.InvokeOtherPlayers, {}, conn);
    };

    if (conn.open) {
        initConnections();
    } else {
        conn.on('open', () => initConnections());
    }
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
        console.log('Successfully connected to the host!')
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

    Object.keys(dataSendingCallbacks).forEach(key => {
        dataSendingCallbacks[key](data);
    });

    if (conn) conn.send(data);
    else {
        Object.keys(connectedPeers).forEach(id => {
            let peerConn = connectedPeers[id];
            peerConn.send(data);
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
 * @template {string} K
 * @param {(id: string) => (void)} callback 
 * @param {K} name 
 * @returns {K}
 */
export function onPlayerRemoved(callback, name) {
    playerRemovedCallbacks[name] = callback;
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
 * @template {keyof SyncTypeData} T
 * @template {string} K
 * @param {T} type
 * @param {(data: SyncTypeData[T]) => (void)} callback 
 * @param {K} name 
 * @returns {K}
 */
export function onDataSending(type, callback, name) {
    dataSendingCallbacks[name] = (data) => {
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