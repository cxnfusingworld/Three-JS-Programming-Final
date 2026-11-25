//~ Imports

import * as THREE from "three"
import { World } from "../classes/world.js"
import { Player } from "../classes/player.js"
import { DataManager } from "./data.js"
import { CooldownManager, InputHandler } from "./utils.js"

//~ Types

/**
 * @typedef {{
 *  Scene: THREE.Scene,
 *  World: World,
 *  Clock: THREE.Clock,
 *  Camera: THREE.PerspectiveCamera,
 *  Player: Player,
 *  Players: Object.<string, { 
	* Connection: any, 
	* Mesh: THREE.Mesh, 
	* MeshAdded: boolean,
	* State: {
		* Name: string,
		* Kills: number,
		* Health: number,
	* }
 * 	}>,
 *  Input: InputHandler,
 *  DataManager: DataManager,
 *  CooldownManager: CooldownManager,
 *  DeltaTime: number,
 * 	Kills: number,
 * 	GameMode?: "FFA" | "Deathmatch"
 * }} State
 */

//~ Public API

/**
 * @type {State}
 */
export const State = {
	Players: {},
	DeltaTime: 0.1,
	Kills: 0,
}