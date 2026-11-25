//~ Imports

import * as THREE from 'three';
import { getClientId, onDataRecieved, onPlayerAdded, onPlayerRemoved, sendData } from './net.js';
import { State } from './state.js';
import { Enum } from './enums.js';
import { EffectRegistry } from './effectRegistry.js';
import { applyVelocity } from './utils.js';
import { updateDeathScreen, updateHealthUI, updateLeaderboardUI } from './ui.js';

//~ Constants

const PlayerGeometry = new THREE.CapsuleGeometry(0.5, 1, 10, 20);
const PlayerMaterial = new THREE.MeshStandardMaterial({
	color: new THREE.Color().setRGB(1, 0.55, 0.2),
	emissive: new THREE.Color().setRGB(1, 0.55, 0.2),
	emissiveIntensity: 4,
});

//~ Helper Functions

/**
 * @param {string} id
 */
function syncPlayer(id) {
	let playerMesh = new THREE.Mesh(PlayerGeometry, PlayerMaterial);
	playerMesh.castShadow = true;

	State.Players[id].Mesh = playerMesh;
	State.Players[id].MeshAdded = false;

	sendData(Enum.SyncType.PlayerUpdate, {
		id: getClientId(),

		x: State.Player.mesh.position.x,
		y: State.Player.mesh.position.y,
		z: State.Player.mesh.position.z
	}, State.Players[id].Connection);
}

/**
 * @param {string} id
 */
function removePlayer(id) {
	let playerData = State.Players[id];
	if (!playerData) return;

	State.World.scene.remove(playerData.Mesh);
	console.log(`Removed mesh for player: ${id}`);
}

//~ Main

// Player Updates

onPlayerAdded(syncPlayer, "ADD_PLAYER_SYNC");
onPlayerRemoved(removePlayer, "REMOVE_PLAYER_SYNC");

onDataRecieved(Enum.SyncType.PlayerUpdate, (data) => {
	let playerData = State.Players[data.id];
	if (!playerData || !playerData.Mesh) return;

	if (!playerData.MeshAdded && State.World) {
		State.World.scene.add(playerData.Mesh);
		playerData.MeshAdded = true;
	}

	playerData.Mesh.position.x = data.x || playerData.Mesh.position.x;
	playerData.Mesh.position.y = data.y || playerData.Mesh.position.y;
	playerData.Mesh.position.z = data.z || playerData.Mesh.position.z;

	playerData.State.Health = data.health || playerData.State.Health;

	if (data.kills) {
		playerData.State.Kills = data.kills;
		updateLeaderboardUI();
	}
}, "PLAYER_UPDATE_SYNC");
onDataRecieved(Enum.SyncType.PlayerSpawnUpdate, (data) => {
	let playerData = State.Players[data.id];
	if (!playerData) return;

	let spawned = data.spawned;
	playerData.Mesh.visible = spawned;
}, "PLAYER_SPAWN_UPDATE_SYNC");

// Damage & Kills

onDataRecieved(Enum.SyncType.Damage, (data) => {
	if (!State.Player || !data.damage || State.Player.health <= 0) return;

	State.Player.health -= data.damage;
	updateHealthUI();

	console.log(`Took ${data.damage} damage, now at ${State.Player.health} HP.`);
	if (State.Player.health <= 0) {
		console.log("You died.")

		updateDeathScreen(true);

		sendData(Enum.SyncType.PlayerKilled, {
			victimId: getClientId(),
			killerId: data.id,
		}, State.Players[data.id].Connection)
	}

	sendData(Enum.SyncType.PlayerUpdate, {
		id: getClientId(),
		health: State.Player.health,
	});
}, "DAMAGE_SYNC");

onDataRecieved(Enum.SyncType.PlayerKilled, () => {
	State.Kills++;

	sendData(Enum.SyncType.PlayerUpdate, {
		id: getClientId(),
		kills: State.Kills,
	});
	
	updateLeaderboardUI();
}, "PLAYER_KILLED_SYNC");

// Other

onDataRecieved(Enum.SyncType.SpawnEffect, (data) => {
	EffectRegistry.spawnEffect(data.effectName, data.data, false);
}, "SPAWN_EFFECT_SYNC");

onDataRecieved(Enum.SyncType.ApplyVelocity, applyVelocity, "APPLY_VELOCITY_SYNC")