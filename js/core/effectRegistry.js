//~ Imports

import * as THREE from 'three';

//~ Types

/**
 * @typedef {{
 *  x: number,
 *  y: number,
 *  z: number,
 *  radius: number
 * }} ExplosionData
 */

/**
 * @typedef {{
 *  Explosion: ExplosionData,
 * }} EffectPayloadMap
 */

//~ Public API

class EffectRegistryCreator {
    constructor() {
        this.effects = {
            /**
             * @param {ExplosionData} data
             */
            "Explosion": (data) => {
                console.log("BOOM");
            }
        };
    }
}

export const EffectRegistry = new EffectRegistryCreator();