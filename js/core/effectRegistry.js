//~ Imports

import { Explosion } from "../effects/explosion.js";
import { Fireball } from "../effects/fireball.js";
import { Shockwave } from "../effects/shockwave.js";
import { Enum } from "./enums.js";
import { sendData } from "./net.js";

//~ Types

/**
 * @typedef {{
 *  Explosion: import("../effects/explosion.js").ExplosionData,
 *  Shockwave: import("../effects/shockwave.js").ShockwaveData,
 *  Fireball: import("../effects/fireball.js").FireballData,
 * }} EffectPayloadMap
 */

//~ Helper Functions

/**
 * @template {Object} T
 * @param {T} obj
 * @returns {T}
 */
function removeFunctions(obj) {
    if (obj === null || typeof(obj) !== 'object') {
        return typeof(obj) === 'function' ? undefined : obj;
    }

    if (Array.isArray(obj)) {
        return obj
            .map(item => this.removeFunctions(item))
            .filter(item => item !== undefined);
    }

    const cleanObj = {};
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (typeof(value) !== 'function') {
            const cleaned = removeFunctions(value);
            if (cleaned !== undefined) {
                cleanObj[key] = cleaned;
            }
        }
    }
    return cleanObj;
}

//~ Public API

class EffectRegistryCreator {
    constructor() {
        this.effects = {
            "Explosion": Explosion,
            "Shockwave": Shockwave,
            "Fireball": Fireball,
        };
    }

    /**
     * @template {keyof EffectPayloadMap} K
     * @param {K} effectName 
     * @param {EffectPayloadMap[K]} data 
     * @param {boolean?} replicate
     * @param {EffectPayloadMap[K]?} replicatedData
     */
    spawnEffect(effectName, data, replicate, replicatedData) {
        let effect = this.effects[effectName];
        if (!effect) {
            console.log(`No effect with name ${effectName} exists.`);
            return;
        }
        effect(data);

        if (replicate) {
            replicatedData = removeFunctions(replicatedData || data);
            sendData(Enum.SyncType.SpawnEffect, {
                effectName: effectName,
                data: replicatedData,
            });
        }
    }
}

export const EffectRegistry = new EffectRegistryCreator();