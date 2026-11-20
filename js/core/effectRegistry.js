//~ Imports

import { Explosion } from "../effects/explosion";

//~ Types

/**
 * @typedef {{
 *  Explosion: import("../effects/explosion").ExplosionData,
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