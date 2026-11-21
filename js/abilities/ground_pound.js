//~ Imports

import * as THREE from 'three';
import { State } from "../core/state.js";
import { sendData } from '../core/net.js';
import { Enum } from '../core/enums.js';

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
            sendData(Enum.SyncType.SpawnEffect, {
                effectName: "Shockwave",
                data: {
                    x: player.mesh.position.x,
                    y: player.mesh.position.y - 1,
                    z: player.mesh.position.z,
                    innerRadius: 7,
                    outerRadius: 8,

                    color: new THREE.Color().setRGB(1, 1, 1),
                    startOpacity: 0.05,
                    emissiveIntensity: 10,

                    duration: 1000,
                }
            });
            sendData(Enum.SyncType.SpawnEffect, {
                effectName: "Explosion",
                data: {
                    x: player.mesh.position.x,
                    y: player.mesh.position.y - 1,
                    z: player.mesh.position.z,
                    radius: 1.5,

                    color: new THREE.Color().setRGB(1, 1, 1),
                    startOpacity: 0.1,
                    emissiveIntensity: 5,

                    duration: 300,
                }
            });

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