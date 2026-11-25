//~ Imports

import * as THREE from 'three';

import { Sword } from './sword.js'

import { Config } from '../core/config.js'
import { State } from '../core/state.js';
import { getClientId, sendData } from '../core/net.js';
import { InputHandler } from '../core/utils.js';
import { Enum } from '../core/enums.js';

import { AbilityHandler } from '../core/abilityHandler.js';

//~ Constants

const GRAVITY = Config.GRAVITY;
const DIAGONAL_MOVE_FACTOR = Math.SQRT1_2;

//~ Public API

export class Player {
	/**
	 * @param {THREE.scene} scene
	 * @param {InputHandler} input
	 */
	constructor(scene, input) {
		this.scene = scene;
		this.input = input;
		this.world = State.World;

		this.sword = new Sword(scene, this, input);

		this.speed = Config.WALK_SPEED;
		this.acceleration = Config.WALK_ACCELERATION;
		this.jumpForce = Config.JUMP_FORCE;

		this.health = 100;
		this.maxHealth = 100;
		this.velocity = new THREE.Vector3(0, 0, 0);
		this.isGrounded = true;

		const geometry = new THREE.CapsuleGeometry(0.5, 1, 10, 20);
		const material = new THREE.MeshStandardMaterial({
			color: new THREE.Color().setRGB(0.2, 0.4, 1),
			emissive: new THREE.Color().setRGB(0.2, 0.4, 1),
			emissiveIntensity: 4,
		});
		this.mesh = new THREE.Mesh(geometry, material);

		this.mesh.position.set(0, 1, 0);
		this.mesh.castShadow = true;
		scene.add(this.mesh);

		input.onKeyDown(function (input) {
			if (input.code === "KeyQ") AbilityHandler.useAbility("Dash");
			if (input.code === "KeyE") AbilityHandler.useAbility("GroundPound");
			if (input.code === "KeyF") AbilityHandler.useAbility("Fireball");
		})
	}

	//~ Public Methods

	/**
	 * @param {number} dt
	 */
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
		State.Camera.getWorldDirection(cameraForward);
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
			this.velocity.y = this.jumpForce + Math.max(0, this.velocity.y)
			this.isGrounded = false;
		}

		if (!this.isGrounded) {
			this.velocity.y -= GRAVITY * dt;
		}

		this.mesh.position.x += this.velocity.x * dt;
		this.mesh.position.z += this.velocity.z * dt;
		this.mesh.position.y += this.velocity.y * dt;

		this.mesh.position.x = Math.min(Math.max(-Config.MAP_SIZE / 2, this.mesh.position.x), Config.MAP_SIZE / 2);
		this.mesh.position.z = Math.min(Math.max(-Config.MAP_SIZE / 2, this.mesh.position.z), Config.MAP_SIZE / 2);

		this.isGrounded = this.mesh.position.y <= 1;

		if (this.mesh.position.y <= 1) {
			this.mesh.position.y = 1;
			this.velocity.y = 0;
		}

		State.World.collider.position.y = this.mesh.position.y;

		this.sword.update(dt);

		sendData(Enum.SyncType.PlayerUpdate, {
			id: getClientId(),

			x: this.mesh.position.x,
			y: this.mesh.position.y,
			z: this.mesh.position.z,
			rotation: this.mesh.rotation.y
		});
	}
}