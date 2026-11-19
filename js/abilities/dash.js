//~ Imports

import { State } from "../core/state.js";

//~ Public API

export class DashAbility {
    constructor() {}

    /**
     * @returns {boolean}
     */
    activate() {
        let player = State.Player;
        if (!player) return false;

        player.velocity.normalize().multiplyScalar(100);

        return false;
    }
}

export const Dash = new DashAbility()