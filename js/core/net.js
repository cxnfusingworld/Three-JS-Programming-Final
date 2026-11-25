//~ Imports

import Peer from 'peerjs';
import { Enum } from './enums.js';
import { State } from './state.js';
import { sleep } from './utils.js';

//~ Types

/**
  * @typedef {import('../core/effectRegistry.js').EffectPayloadMap} EffectPayloadMap
  */

/**
 * @typedef {{
 *  type: Enum["SyncType"]["PlayerUpdate"],
 *  id: string,
 *  x: number?,
 *  y: number?,
 *  z: number?,
 *  health: number?,
 * 	kills: number?,
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
 *  type: Enum["SyncType"]["PlayerSpawnUpdate"],
 * 	id: string,
 * 	spawned: boolean,
 * }} SyncType_PlayerSpawnUpdate
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
 * 	id: string,
 *  damage: number,
 * }} SyncType_Damage
 */

/**
 * @typedef {{
 *  type: Enum["SyncType"]["ApplyVelocity"],
 *  x?: number,
 *  y?: number,
 *  z?: number,
 *  scalar?: number,
 *  applyType?: "add" | "subtract" | "multiply" | "divide"
 * }} SyncType_ApplyVelocity
 */

/**
 * @typedef {{
 *  PLAYER_UPDATE: SyncType_PlayerUpdate,
 *  PLAYER_ADDED: SyncType_PlayerAdded,
 *  PLAYER_SPAWN_UPDATE: SyncType_PlayerSpawnUpdate,
 *  PLAYER_KILLS_UPDATE: SyncType_PlayerKillsUpdate,
 *  INVOKE_OTHERS: SyncType_InvokeOtherPlayers,
 *  SPAWN_EFFECT: SyncType_SpawnEffect,
 *  DAMAGE: SyncType_Damage,
 *  APPLY_VELOCITY: SyncType_ApplyVelocity,
 * }} SyncTypeData
 */

//~ Constants

const peer = new Peer();

const DataRecievedCallbacks = {};
const DataSendingCallbacks = {};
const PlayerAddedCallbacks = {};
const PlayerRemovedCallbacks = {};

const ConnectedPeers = {}

//~ Variables

/**
 * @type {string?}
 */
let clientId = null;

//~ Helper Functions

function initPlayer(conn) {
	if (ConnectedPeers[conn.peer] === conn) return;
	if (ConnectedPeers[conn.peer]) ConnectedPeers[conn.peer].close();

	console.log(`Initializing other player with id ${conn.peer}.`);

	ConnectedPeers[conn.peer] = conn;
	State.Players[conn.peer] = {
		Connection: conn,
		State: {
			Name: "Opponent",
			Kills: 0,
			Health: 100,
		}
	};

	Object.values(PlayerAddedCallbacks).forEach(callback => {
		callback(conn.peer);
	});

	let handleDisconnect = () => {
		if (ConnectedPeers[conn.peer] === conn) {
			console.log(`Player disconnected: ${conn.peer}`);

			Object.values(PlayerRemovedCallbacks).forEach(callback => {
				callback(conn.peer);
			});

			delete ConnectedPeers[conn.peer];
			delete State.Players[conn.peer];
		}
	};

	let initConnections = () => {
		conn.on('data', (data) => {
			if (data.type == Enum.SyncType.PlayerAdded) {
				if (data.id === clientId || ConnectedPeers[data.id]) return;

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
				Object.keys(ConnectedPeers).forEach(id => {
					if (id == conn.peer) return;
					console.log(`Sending other peer id to ${conn.peer}, with id ${id}.`)
					sendData(Enum.SyncType.PlayerAdded, { id: id }, conn);
				});

				return;
			}

			Object.values(DataRecievedCallbacks).forEach(callback => {
				callback(data);
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
	// document.getElementById('my-id').innerText = id;
	clientId = id;
});

peer.on('connection', (conn) => {
	console.log('A player connected to us!');
	initPlayer(conn);
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
	if (Object.keys(ConnectedPeers).length === 0) return;

	data.type = type;

	Object.values(DataSendingCallbacks).forEach(callback => {
		callback(data);
	});

	if (conn) conn.send(data);
	else {
		Object.keys(ConnectedPeers).forEach(id => {
			let peerConn = ConnectedPeers[id];
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
	PlayerAddedCallbacks[name] = callback;
	return name;
}

/**
 * @template {string} K
 * @param {(id: string) => (void)} callback
 * @param {K} name
 * @returns {K}
 */
export function onPlayerRemoved(callback, name) {
	PlayerRemovedCallbacks[name] = callback;
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
	DataRecievedCallbacks[name] = (data) => {
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
	DataSendingCallbacks[name] = (data) => {
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

/**
 * @param {string} id
 * @returns {any?}
 */
export function getConn(id) {
	return ConnectedPeers[id];
}

/**
 * @param {string} id
 */
export async function connectToPeer(id) {
	console.log('Connecting to:', id);

	let conn = peer.connect(id);
	if (!conn) return false;

	let success = false;

	conn.on('open', () => {
		success = true;

		console.log('Successfully connected to the host!')

		initPlayer(conn);
	});

	await new Promise(async (resolve) => {
		let elapsed = 0;
		while (elapsed < 3000) {
			elapsed += 100;
			if (success) break;
			await sleep(100);
		}
		resolve(success)
	}).catch();

	return success;
}