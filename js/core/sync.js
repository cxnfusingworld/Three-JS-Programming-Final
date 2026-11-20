//~ Imports

import * as THREE from 'three';
import { onDataRecieved, onDataSending, onPlayerAdded, onPlayerRemoved } from './net.js';
import { State } from './state.js';
import { Enum } from './enums.js';
import { EffectRegistry } from './effectRegistry.js';

//~ Constants

const LoadedPlayers = {}

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

    LoadedPlayers[id] = {
        Mesh: playerMesh,
        MeshAdded: false,
    };
}

function removePlayerMesh(id) {
    if (LoadedPlayers[id]) {
        State.World.scene.remove(LoadedPlayers[id].Mesh);
        delete LoadedPlayers[id];
        console.log(`Removed mesh for player: ${id}`);
    }
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
    let playerData = LoadedPlayers[data.id];
    if (!playerData || !playerData.Mesh) return;

    if (!playerData.MeshAdded && State.World) {
        State.World.scene.add(playerData.Mesh);
        playerData.MeshAdded = true;
    }

    playerData.Mesh.position.x = data.x;
    playerData.Mesh.position.y = data.y;
    playerData.Mesh.position.z = data.z;
    playerData.Mesh.rotation.y = data.rotation;
}, "PLAYER_SYNC");

onDataRecieved(Enum.SyncType.SpawnEffect, (data) => {
    let effect = EffectRegistry.effects[data.effectName];
    if (!effect) return;
    effect(data.data);
})
onDataSending(Enum.SyncType.SpawnEffect, (data) => {
    let effect = EffectRegistry.effects[data.effectName];
    if (!effect) return;
    effect(data.data);
})

onDataRecieved(Enum.SyncType.Damage, (data) => {
    if (!State.Player || !data.damage) return;
    State.Player.health -= data.damage;
})