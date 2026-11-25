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
 *  innerRadius: number,
 *  outerRadius: number,
 *  color?: THREE.Color,
 *  emissiveIntensity?: number,
 *  startOpacity?: number,
 *  duration?: number,
 *  onHit?: (playerId: string) => void,
 *  canHitSelf?: boolean,
 * }} ShockwaveData
 */

//~ Public Methods

/**
 * @param {ShockwaveData} data
 */
export function Shockwave(data) {
	let geometry = new THREE.RingGeometry((data.innerRadius || 10) / 10, (data.outerRadius || 11) / 10);
	let material = new THREE.MeshStandardMaterial({
		color: data.color || 0xff5500,
		transparent: true,
		opacity: data.startOpacity || 0.8,
		emissive: data.color || 0xff5500,
		emissiveIntensity: data.emissiveIntensity || 6,
		depthWrite: false,
	});

	let ShockwaveMesh = new THREE.Mesh(geometry, material);
	ShockwaveMesh.position.set(data.x, data.y + 0.1, data.z);
	ShockwaveMesh.rotateX(THREE.MathUtils.degToRad(-90));

	State.World.scene.add(ShockwaveMesh);

	let startTime = performance.now();
	let duration = data.duration || 400;
	let maxOuterRadius = data.outerRadius || 11;
	let maxInnerRadius = data.innerRadius || 10;

	/** @type {Set<string>} */
	let hitPlayers = new Set();

	let update = (currentTime) => {
		let elapsed = currentTime - startTime;
		let progress = Math.min(elapsed / duration, 1.0);

		let currentOuterRadius = maxOuterRadius * progress;
		let currentInnerRadius = maxInnerRadius * progress
		let currentScale = maxOuterRadius * progress;
		ShockwaveMesh.scale.set(currentScale, currentScale, currentScale);

		material.opacity = (data.startOpacity || 0.8) * (1.0 - progress);

		if (data.onHit) {
			let checkHit = (playerId) => {
				let player = State.Players[playerId];
				if (playerId === getClientId()) player = { Mesh: State.Player.mesh };

				if (!player || !player.Mesh || hitPlayers.has(playerId)) return;

				let dx = player.Mesh.position.x - data.x;
				let dy = player.Mesh.position.y - data.y;
				let dz = player.Mesh.position.z - data.z;
				let distance = Math.sqrt(dx * dx + dz * dz);

				if (distance <= currentOuterRadius && distance >= currentInnerRadius && Math.abs(dy) <= 1) {
					hitPlayers.add(playerId);
					console.log(`Shockwave hit player: ${playerId}!`);
					data.onHit(playerId);
				}
			}

			Object.keys(State.Players).forEach(checkHit);
			if (data.canHitSelf === true) checkHit(getClientId());
		}

		if (progress < 1.0) {
			requestAnimationFrame(update);
		} else {
			State.World.scene.remove(ShockwaveMesh);
			geometry.dispose();
			material.dispose();
		}
	};

	requestAnimationFrame(update);
}