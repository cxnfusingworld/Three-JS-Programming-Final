//~ Imports

import * as THREE from 'three';
import { onDataRecieved, onDataSending, onPlayerAdded, onPlayerRemoved } from './net.js';
import { State } from './state.js';
import { Enum } from './enums.js';
import { EffectRegistry } from './effectRegistry.js';
import { applyVelocity } from './utils.js';

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
function syncPlayerMesh(id) {
    let playerMesh = new THREE.Mesh(PlayerGeometry, PlayerMaterial);
    playerMesh.castShadow = true;

    State.Players[id].Mesh = playerMesh;
    State.Players[id].MeshAdded = false;
}

/**
 * @param {string} id 
 */
function removePlayerMesh(id) {
    let playerData = State.Players[id];
    if (!playerData) return;

    State.World.scene.remove(playerData.Mesh);
    console.log(`Removed mesh for player: ${id}`);
}

//~ Public API

/**
 * @param {string} meshId 
 */
export function syncMesh(meshId) {

}

//~ Main

onPlayerAdded(syncPlayerMesh, "ADD_PLAYER_SYNC");
onPlayerRemoved(removePlayerMesh, "REMOVE_PLAYER_SYNC");

onDataRecieved(Enum.SyncType.PlayerUpdate, (data) => {
    let playerData = State.Players[data.id];
    if (!playerData || !playerData.Mesh) return;

    if (!playerData.MeshAdded && State.World) {
        State.World.scene.add(playerData.Mesh);
        playerData.MeshAdded = true;
    }

    playerData.Mesh.position.x = data.x;
    playerData.Mesh.position.y = data.y;
    playerData.Mesh.position.z = data.z;
    playerData.Mesh.rotation.y = data.rotation;
}, "PLAYER_UPDATE_SYNC");

onDataRecieved(Enum.SyncType.SpawnEffect, (data) => {
    EffectRegistry.spawnEffect(data.effectName, data.data, false);
}, "SPAWN_EFFECT_SYNC");

onDataRecieved(Enum.SyncType.Damage, (data) => {
    if (!State.Player || !data.damage || State.Player.health <= 0) return;
    State.Player.health -= data.damage;
    console.log(`Took ${data.damage} damage, now at ${State.Player.health} HP.`);
    if (State.Player.health <= 0) {
        console.log("You died.")
    }
}, "DAMAGE_SYNC");

onDataRecieved(Enum.SyncType.ApplyVelocity, applyVelocity, "APPLY_VELOCITY_SYNC")