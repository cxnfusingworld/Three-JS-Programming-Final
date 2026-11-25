//~ Imports

import * as THREE from 'three';
import { State } from "../core/state.js";

//~ Public API

export class DashAbility {
	constructor() { }

	/**
	 * @returns {boolean}
	 */
	activate() {
		let player = State.Player;
		if (!player || !State.CooldownManager) return false;
		if (State.CooldownManager.onCooldown("Ability_Dash")) return false;
		State.CooldownManager.setCooldown("Ability_Dash", 1);

		player.velocity.normalize().multiply(new THREE.Vector3(100, 20, 100));

		return false;
	}
}

export const Dash = new DashAbility()