//~ Imports

import { Explosion } from "../effects/explosion.js";

//~ Types

/**
 * @typedef {{
 *  Explosion: import("../effects/explosion.js").ExplosionData,
 * }} EffectPayloadMap
 */

//~ Public API

class EffectRegistryCreator {
    constructor() {
        this.effects = {
            "Explosion": Explosion,
        };
    }
}

export const EffectRegistry = new EffectRegistryCreator();