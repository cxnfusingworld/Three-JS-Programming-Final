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
 *  Players: Object.<string, { Connection: any, Mesh: THREE.Mesh, MeshAdded: boolean }>,
 *  Input: InputHandler,
 *  DataManager: DataManager,
 *  CooldownManager: CooldownManager,
 *  DeltaTime: number,
 * }} State
 */

//~ Public API

/**
 * @type {State}
 */
export const State = {
	Players: {},
	DeltaTime: 0.1,
}