//~ Imports

import * as THREE from 'three';
import { State } from '../core/state.js';
import { getClientId } from '../core/net.js';

//~ Types

/**
 * @typedef {{
 *  x: number,
 *  y: number,
 *  z: number,
 *  radius: number,
 *  dirX: number,
 *  dirY: number,
 *  dirZ: number,
 *  speed?: number,
 *  color?: THREE.Color,
 *  emissiveIntensity?: number,
 *  hitRadius: number?,
 *  onFloorHit?: (finalPos: THREE.Vector3) => void,
 *  onHit?: (playerId: string) => void,
 *  canHitSelf?: boolean,
 * }} FireballData
 */

//~ Public Methods

/**
 * @param {FireballData} data
 */
export function Fireball(data) {
	let geometry = new THREE.SphereGeometry(data.radius || 0.5, 16, 16);
	let material = new THREE.MeshStandardMaterial({
		color: data.color || new THREE.Color().setRGB(1, 0.3, 0),
		emissive: data.color || new THREE.Color().setRGB(1, 0.3, 0),
		emissiveIntensity: data.emissiveIntensity || 6,
	});

	let fireballMesh = new THREE.Mesh(geometry, material);
	fireballMesh.position.set(data.x, data.y, data.z);

	State.World.scene.add(fireballMesh);

	let speed = (data.speed || 10) * 4;
	let dir = new THREE.Vector3(data.dirX, data.dirY, data.dirZ).normalize();

	/** @type {Set<string>} */
	let hitPlayers = new Set();

	let update = () => {
		let dt = State.DeltaTime;

		let moveVector = dir.clone().multiplyScalar(speed * dt);
		fireballMesh.position.add(moveVector);

		if (data.onHit) {
			let checkHit = (playerId) => {
				let player = State.Players[playerId];
				if (playerId === getClientId()) player = { Mesh: State.Player.mesh };

				if (!player || !player.Mesh || hitPlayers.has(playerId)) return;

				let dx = player.Mesh.position.x - fireballMesh.position.x;
				let dy = player.Mesh.position.y - fireballMesh.position.y;
				let dz = player.Mesh.position.z - fireballMesh.position.z;
				let distance = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);

				if (distance <= (data.hitRadius || geometry.parameters.radius)) {
					hitPlayers.add(playerId);
					console.log(`Fireball hit player: ${playerId}!`);
					data.onHit(playerId);
				}
			}

			Object.keys(State.Players).forEach(checkHit);
			if (data.canHitSelf === true) checkHit(getClientId());
		}

		if (Math.abs(fireballMesh.position.y) <= (data.hitRadius || geometry.parameters.radius) || Math.sign(fireballMesh.position.y - speed * dt) !== Math.sign(fireballMesh.position.y)) {
			if (data.onFloorHit) data.onFloorHit(fireballMesh.position);

			State.World.scene.remove(fireballMesh);
			geometry.dispose();
			material.dispose();

			return;
		}

		requestAnimationFrame(update);
	};

	requestAnimationFrame(update);
}