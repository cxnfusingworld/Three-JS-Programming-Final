//~ Imports

import * as THREE from 'three';
import { onDataRecieved } from './net.js';
import { State } from './state.js';

//~ Constants

const geometry = new THREE.CapsuleGeometry(0.5, 1, 10, 20);
const material = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color().setRGB(1, 0.4, 4),
    emissive: new THREE.Color().setRGB(1, 0.4, 4),
    emissiveIntensity: 4,
});
let playerMesh = new THREE.Mesh(geometry, material);

//~ Variables

let isMeshAdded = false;

//~ Main

onDataRecieved(function(data) {
    if (data.type === 'player-update') {
        if (!isMeshAdded && State.World) {
            const targetScene = State.World.scene || State.World; 
            targetScene.add(playerMesh);
            isMeshAdded = true;
        }

        playerMesh.position.x = data.x;
        playerMesh.position.y = data.y;
        playerMesh.position.z = data.z;
        playerMesh.rotation.y = data.rotation;
    }
}, "PLAYER_SYNC");