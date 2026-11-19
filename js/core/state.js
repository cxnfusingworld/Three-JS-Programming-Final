//~ Imports

import * as THREE from "three"
import { World } from "../classes/world.js"
import { Player } from "../classes/player.js"
import { data } from "./data.js"

//~ Types

/**
 * @typedef {Object} State
 * @property {THREE.Scene} Scene
 * @property {World} World
 * @property {THREE.PerspectiveCamera} Camera
 * @property {Player} Player
 * @property {data} Data
 */

//~ Public API

/**
 * @type {State}
 */
export const State = {}