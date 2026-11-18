//~ Imports

import * as THREE from 'three';

//~ Public API

export class Spike {
    constructor(scene, x, z) {
        const geometry = new THREE.ConeGeometry(0.5, 1.5, 20);
        const material = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setRGB(1, 0, 0),
            emissive: new THREE.Color().setRGB(1, 0, 0),
            emissiveIntensity: 2,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, 0.75, z);
        this.mesh.castShadow = true;
        
        scene.add(this.mesh);
    }

    checkCollision(playerMesh) {
        const distance = this.mesh.position.distanceTo(playerMesh.position);
        return distance < 1.0;
    }
}