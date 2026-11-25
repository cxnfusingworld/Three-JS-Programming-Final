//~ Imports

import * as THREE from 'three';
import { State } from "../core/state.js";
import { EffectRegistry } from '../core/effectRegistry.js';
import { getClientId, sendData } from '../core/net.js';
import { Enum } from '../core/enums.js';
import { applyVelocity } from '../core/utils.js';

//~ Public API

export class FireballAbility {
	constructor() {
		this.raycaster = new THREE.Raycaster();
		this.pointer = new THREE.Vector2();
		this.lookDir = new THREE.Vector3();
	}

	/**
	 * @returns {boolean}
	 */
	activate() {
		let player = State.Player;
		if (!player) return false;
		if (!State.CooldownManager || State.CooldownManager.onCooldown("Ability_Fireball")) return false;

		let lastMouseInput = State.Input && State.Input.lastMouseInput;
		if (!lastMouseInput) return false;

		this.pointer.set(
			(lastMouseInput.clientX / window.innerWidth) * 2 - 1,
			-(lastMouseInput.clientY / window.innerHeight) * 2 + 1
		);
		this.raycaster.setFromCamera(this.pointer, State.Camera);

		let intersects = this.raycaster.intersectObjects([State.World.floor], false);
		let direction

		if (intersects.length > 0) {
			let hitPosition = intersects[0].point;
			if (!hitPosition) return false;
			direction = new THREE.Vector3().subVectors(hitPosition, player.mesh.position).normalize();
		}
		if (!direction) return false;

		State.CooldownManager.setCooldown("Ability_Fireball", 1.5);

		EffectRegistry.spawnEffect("Fireball", {
			x: player.mesh.position.x,
			y: player.mesh.position.y,
			z: player.mesh.position.z,
			radius: 0.5,
			hitRadius: 0.1,

			speed: 10,
			dirX: direction.x,
			dirY: direction.y,
			dirZ: direction.z,

			onHit: (id) => {
				let playerData = State.Players[id];
				let conn = playerData && playerData.Connection;
				if (!conn) return;

				sendData(Enum.SyncType.Damage, { id: getClientId(), damage: 40 }, conn);
			},
			onFloorHit: (finalPos) => {
				EffectRegistry.spawnEffect("Explosion", {
					x: finalPos.x,
					y: finalPos.y - 0.5,
					z: finalPos.z,
					radius: 4,

					color: new THREE.Color().setRGB(1, 0.3, 0),
					startOpacity: 0.2,
					emissiveIntensity: 10,

					duration: 300,

					canHitSelf: true,
					onHit: (id) => {
						if (id === getClientId()) {
							applyVelocity({ y: 20 });
							return;
						}

						let playerData = State.Players[id];
						let conn = playerData && playerData.Connection;
						if (!conn) return;

						sendData(Enum.SyncType.Damage, { id: getClientId(), damage: 25 }, conn);
						sendData(Enum.SyncType.ApplyVelocity, { y: 20 }, conn);
					}
				}, true)
			}
		}, true)

		return true;
	}

	/**
	 * @returns {boolean}
	 */
	update() {
		let player = State.Player;

		return true;
	}
}

export const Fireball = new FireballAbility();