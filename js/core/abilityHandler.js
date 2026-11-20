//~ Imports

import { Enum } from "./enums.js";
import { State } from "./state.js";

import { Dash } from "../abilities/dash.js";
import { GroundPound } from "../abilities/ground_pound.js";

//~ Types

/**
 * @typedef {{
 *  activate: () => (boolean),
 *  update: (dt: number) => (boolean)
 * }} Ability
 */

//~ Constants

const RunningAbilities = [];
const AbilityRegistry = {
    "Dash": Dash,
    "GroundPound": GroundPound
};

//~ Public API

class AbilityHandlerCreator {
    constructor() {}

    /**
     * @param {keyof Enum["Ability"]} name
     */
    useAbility(name) {
        /**
         * @type {Ability}
         */
        let ability = AbilityRegistry[name];
        
        if (!ability) {
            console.warn(`Ability "${name}" not found in registry!`);
            return;
        }

        let runUpdate = ability.activate();
        if (runUpdate && typeof ability.update === 'function') {
            RunningAbilities.push(ability);
        }
    }

    /**
     * @param {number} dt 
     */
    update(dt) {
        for (let i = RunningAbilities.length - 1; i >= 0; i--) {
            let ability = RunningAbilities[i];
            let stopUpdating = ability.update(dt);
            if (!stopUpdating) {
                RunningAbilities.splice(i, 1);
            }
        }
    }
}

export const AbilityHandler = new AbilityHandlerCreator();