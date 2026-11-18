//~ Imports

import * as THREE from 'three';
import { randomColor } from './utils.js';

//~ Constants

const GRAVITY = 30;
const JUMP_FORCE = 12;

const DIAGONAL_MOVE_FACTOR = 1 / Math.sqrt(2);

//~ Public API

export class Player {
    constructor(scene, input) {
        this.input = input;
        this.speed = 8; 

        const geometry = new THREE.CapsuleGeometry(0.5, 1, 10, 20);
        const material = new THREE.MeshStandardMaterial({ color: 0xbf616a });
        this.mesh = new THREE.Mesh(geometry, material);
        
        this.mesh.position.set(0, 1, 0);
        this.mesh.castShadow = true;
        scene.add(this.mesh);

        this.velocity = new THREE.Vector3(0, 0, 0);
        this.isGrounded = true;
    }

    update(dt) {
        let moveX = 0;
        let moveZ = 0;
        if (this.input.isKeyDown('KeyW')) moveZ -= 1;
        if (this.input.isKeyDown('KeyS')) moveZ += 1;
        if (this.input.isKeyDown('KeyA')) moveX -= 1;
        if (this.input.isKeyDown('KeyD')) moveX += 1;

        if (moveX !== 0 && moveZ !== 0) {
            moveX *= DIAGONAL_MOVE_FACTOR;
            moveZ *= DIAGONAL_MOVE_FACTOR;
        }

        this.mesh.position.x += moveX * this.speed * dt;
        this.mesh.position.z += moveZ * this.speed * dt;

        if (this.input.wasKeyDown('Space', 0.1) && this.isGrounded) {
            this.velocity.y = JUMP_FORCE;
            this.isGrounded = false;
        }

        if (!this.isGrounded) {
            this.velocity.y -= GRAVITY * dt;
        }

        this.mesh.position.y += this.velocity.y * dt;

        if (this.mesh.position.y <= 1) {
            this.mesh.position.y = 1;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        if (this.input.isKeyDown('KeyC')) {
            this.mesh.material.color.setHex(randomColor());
        }
    }
}