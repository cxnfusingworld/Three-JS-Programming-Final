//~ Imports

import * as THREE from 'three';
import { State } from './state.js';

//~ Types

/**
 * @typedef {{
 *  x?: number,
 *  y?: number,
 *  z?: number,
 *  scalar?: number,
 *  applyType?: "add" | "subtract" | "multiply" | "divide"
 * }} ApplyVelocityData
 */

//~ Public API

export class InputHandler {
	/**
	 * @param {THREE.Clock} clock
	 */
	constructor(clock) {
		this.clock = clock;

		this.keys = {};
		this.keyPressHistory = {};

		this.keyDownCallbacks = {};
		this.keyUpCallbacks = {};
		this.mouseMovedCallbacks = {};

		this.lastMouseInput = null;

		window.addEventListener('keydown', (input) => {
			this.keys[input.code] = true;
			this.keyPressHistory[input.code] = clock.getElapsedTime();

			Object.values(this.keyDownCallbacks).forEach(callback => {
				callback(input);
			});
		});
		window.addEventListener('keyup', (input) => {
			this.keys[input.code] = false;
			this.keyPressHistory[input.code] = clock.getElapsedTime();

			Object.values(this.keyUpCallbacks).forEach(callback => {
				callback(input);
			});
		});
		window.addEventListener('mousemove', (input) => {
			this.lastMouseInput = input;

			Object.values(this.mouseMovedCallbacks).forEach(callback => {
				callback(input);
			});
		})
	}

	/**
	 * @param {KeyboardEvent.code} code
	 */
	isKeyDown(code) {
		return !!this.keys[code];
	}

	/**
	 * @param {KeyboardEvent.code} code
	 * @param {number} timePeriod
	 */
	wasKeyDown(code, timePeriod) {
		return this.isKeyDown(code) || !!this.keyPressHistory[code] && this.clock.getElapsedTime() - this.keyPressHistory[code] <= timePeriod;
	}

	/**
	 * @template {string} K
	 * @param {(input: MouseEvent) => (void)} callback
	 * @param {K} name
	 * @returns {K}
	 */
	mouseMoved(callback, name) {
		this.mouseMovedCallbacks[name] = callback;
		return name;
	}

	/**
	 * @template {string} K
	 * @param {(input: KeyboardEvent) => (void)} callback
	 * @param {K} name
	 * @returns {K}
	 */
	onKeyDown(callback, name) {
		this.keyDownCallbacks[name] = callback;
		return name;
	}

	/**
	 * @template {string} K
	 * @param {(input: KeyboardEvent) => (void)} callback
	 * @param {K} name
	 * @returns {K}
	 */
	onKeyUp(callback, name) {
		this.keyUpCallbacks[name] = callback;
		return name;
	}
}

export class CooldownManager {
	/**
	 * @param {THREE.Clock} clock
	 */
	constructor(clock) {
		this.clock = clock;

		this.cooldownHistory = {};
	}

	/**
	 * @param {string} name
	 * @param {number} duration
	 */
	setCooldown(name, duration) {
		this.cooldownHistory[name] = this.clock.getElapsedTime() + duration;
	}

	/**
	 * @param {string} name
	 * @returns {boolean}
	 */
	onCooldown(name) {
		let cooldownEnd = this.cooldownHistory[name];
		if (!cooldownEnd) return false;
		return this.clock.getElapsedTime() < cooldownEnd;
	}

	resetAll() {
		Object.keys(this.cooldownHistory).forEach(key => {
			delete this.cooldownHistory[key];
		});
	}
}

export class Randomizer {
	constructor() { }

	/**
	 * @returns {number}
	 */
	randomColor() {
		return Math.floor(Math.random() * (256 ** 3 - 1));
	}
}

//~ Public Methods

/**
 * @param {ApplyVelocityData} data
 * @returns {void}
 */
export function applyVelocity(data) {
	if (!State.Player) return;

	let veloc = new THREE.Vector3(data.x || 0, data.y || 0, data.z || 0).multiplyScalar(data.scalar || 1);
	let applyType = data.applyType || "add";

	if (applyType == "add") State.Player.velocity.add(veloc);
	else if (applyType == "subtract") State.Player.velocity.sub(veloc);
	else if (applyType == "multiply") State.Player.velocity.multiply(veloc);
	else if (applyType == "divide") State.Player.velocity.divide(veloc);
}

/**
 * @param {number} ms
 */
export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}