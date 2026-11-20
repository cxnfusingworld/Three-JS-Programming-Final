//~ Imports

import * as THREE from "three"
import { World } from "../classes/world.js"
import { Player } from "../classes/player.js"
import { DataManager } from "./data.js"
import { CooldownManager } from "./utils.js"

//~ Types

/**
 * @typedef {{
 *  Scene: THREE.Scene,
 *  World: World,
 *  Camera: THREE.PerspectiveCamera,
 *  Player: Player,
 *  DataManager: DataManager,
 *  CooldownManager: CooldownManager,
 * }} State
 */

//~ Public API

/**
 * @type {State}
 */
export const State = {}