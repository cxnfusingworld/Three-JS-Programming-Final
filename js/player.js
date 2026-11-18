//~ Imports

import * as THREE from 'three';
import * as Config from '../config.json'

//~ Constants

const GRAVITY = Config.GRAVITY;
const DIAGONAL_MOVE_FACTOR = Math.SQRT1_2;

//~ Public API

export class Player {
    constructor(scene, input, camera) {
        this.input = input;
        this.camera = camera;
        
        this.speed = Config.WALK_SPEED;
        this.acceleration = Config.WALK_ACCELERATION;
        this.jumpForce = Config.JUMP_FORCE;

        const geometry = new THREE.CapsuleGeometry(0.5, 1, 10, 20);
        const material = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setRGB(0.2, 0.4, 1),
            emissive: new THREE.Color().setRGB(0.2, 0.4, 1),
            emissiveIntensity: 2,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        
        this.mesh.position.set(0, 1, 0);
        this.mesh.castShadow = true;
        scene.add(this.mesh);

        this.velocity = new THREE.Vector3(0, 0, 0);
        this.isGrounded = true;
    }

    //~ Public Methods

    update(dt) {
        let moveX = 0;
        let moveZ = 0;
        if (this.input.isKeyDown('KeyW') || this.input.isKeyDown('ArrowUp')) moveZ -= 1;
        if (this.input.isKeyDown('KeyS') || this.input.isKeyDown('ArrowDown')) moveZ += 1;
        if (this.input.isKeyDown('KeyA') || this.input.isKeyDown('ArrowLeft')) moveX -= 1;
        if (this.input.isKeyDown('KeyD') || this.input.isKeyDown('ArrowRight')) moveX += 1;

        if (moveX !== 0 && moveZ !== 0) {
            moveX *= DIAGONAL_MOVE_FACTOR;
            moveZ *= DIAGONAL_MOVE_FACTOR;
        }

        const cameraForward = new THREE.Vector3();
        this.camera.getWorldDirection(cameraForward);
        cameraForward.y = 0;
        cameraForward.normalize();

        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0)).normalize();

        const moveDir = new THREE.Vector3();
        moveDir.addScaledVector(cameraForward, -moveZ);
        moveDir.addScaledVector(cameraRight, moveX);

        const targetX = moveDir.x * this.speed;
        const targetZ = moveDir.z * this.speed;

        this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, targetX, this.acceleration * dt);
        this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, targetZ, this.acceleration * dt);

        if (this.input.wasKeyDown('Space', Config.JUMP_BUFFER) && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }

        if (!this.isGrounded) {
            this.velocity.y -= GRAVITY * dt;
        }
        
        this.mesh.position.x += this.velocity.x * dt;
        this.mesh.position.z += this.velocity.z * dt;
        this.mesh.position.y += this.velocity.y * dt;

        if (this.mesh.position.y <= 1) {
            this.mesh.position.y = 1;
            this.velocity.y = 0;
            this.isGrounded = true;
        }
    }
}