//~ Imports

import { Explosion } from "../effects/explosion.js";
import { Shockwave } from "../effects/shockwave.js";

//~ Types

/**
 * @typedef {{
 *  Explosion: import("../effects/explosion.js").ExplosionData,
 *  Shockwave: import("../effects/shockwave.js").ShockwaveData,
 * }} EffectPayloadMap
 */

//~ Public API

class EffectRegistryCreator {
    constructor() {
        this.effects = {
            "Explosion": Explosion,
            "Shockwave": Shockwave,
        };
    }
}

export const EffectRegistry = new EffectRegistryCreator();