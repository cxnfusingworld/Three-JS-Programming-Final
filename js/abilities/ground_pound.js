//~ Imports

import * as THREE from 'three';
import { State } from "../core/state.js";

//~ Public API

export class GroundPoundAbility {
    constructor() {
        this.isSlamming = false;
        this.originalHeight = 1;
    }

    /**
     * @returns {boolean}
     */
    activate() {
        let player = State.Player;
        if (!player || player.isGrounded) return false;
        if (!State.CooldownManager || State.CooldownManager.onCooldown("Ability_GroundPound")) return false;
        State.CooldownManager.setCooldown("Ability_GroundPound", 1.5);

        player.velocity.y = -80;

        this.isSlamming = true;
        this.originalHeight = player.mesh.position.y;

        return true;
    }

    /**
     * @returns {boolean}
     */
    update() {
        let player = State.Player;
        if (!player || !this.isSlamming) return false;
        if (player.isGrounded || player.mesh.position.y <= 1) {
            player.velocity.y = 8 * Math.sqrt(this.originalHeight); 
            player.isGrounded = false;

            this.isSlamming = false;
            this.originalHeight = 1;

            return false;
        }

        player.velocity.y = -80;

        return true;
    }
}

export const GroundPound = new GroundPoundAbility();