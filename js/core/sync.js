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

//~ Variables

let isMeshAdded = false;

//~ Helper Functions

/**
 * @param {string} id 
 */
function syncPlayerMesh(id) {
    let playerMesh = new THREE.Mesh(PlayerGeometry, PlayerMaterial);
    PlayerMeshes[id] = playerMesh
}

//~ Public API

/**
 * @param {string} meshId 
 */
export function syncMesh(meshId) {

}

//~ Main

onPlayerAdded(syncPlayerMesh);
onDataRecieved("PLAYER_UPDATE", function (data) {
    let playerMesh = PlayerMeshes[data.id];

    if (!isMeshAdded && State.World) {
        const targetScene = State.World.scene || State.World;
        targetScene.add(playerMesh);
        isMeshAdded = true;
    }

    playerMesh.position.x = data.x;
    playerMesh.position.y = data.y;
    playerMesh.position.z = data.z;
    playerMesh.rotation.y = data.rotation;
}, "PLAYER_SYNC");