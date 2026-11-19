//~ Imports

import * as THREE from 'three';
import { onDataRecieved, onPlayerAdded } from './net.js';
import { State } from './state.js';
import { Enum } from './enums.js';

//~ Constants

const PlayerMeshes = {}

const PlayerGeometry = new THREE.CapsuleGeometry(0.5, 1, 10, 20);
const PlayerMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setRGB(1, 0.4, 4),
    emissive: new THREE.Color().setRGB(1, 0.4, 4),
    emissiveIntensity: 4,
});

//~ Helper Functions

/**
 * @param {string} id 
 */
function syncPlayerMesh(id) {
    let playerMesh = new THREE.Mesh(PlayerGeometry, PlayerMaterial);
    PlayerMeshes[id] = {
        Mesh: playerMesh,
        MeshAdded: false,
    };
}

//~ Public API

/**
 * @param {string} meshId 
 */
export function syncMesh(meshId) {

}

//~ Main

onPlayerAdded(syncPlayerMesh);
onDataRecieved(Enum.SyncType.PlayerUpdate, function (data) {
    let playerData = PlayerMeshes[data.id];
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