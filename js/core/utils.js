//~ Imports

import * as THREE from 'three';

//~ Public API

export class InputHandler {
    /**
     * @param {THREE.Clock} clock 
     */
    constructor(clock) {
        this.clock = clock;
        
        this.keys = {};
        this.keyPressHistory = {};

        this.keyDownCallbacks = {};
        this.keyUpCallbacks = {};
        this.mouseMovedCallbacks = {};

        this.lastMouseInput = null;
        
        window.addEventListener('keydown', (input) => {
            this.keys[input.code] = true;
            this.keyPressHistory[input.code] = clock.getElapsedTime();
            
            Object.keys(this.keyDownCallbacks).forEach(key => {
                this.keyDownCallbacks[key](input);                
            });            
        });
        window.addEventListener('keyup', (input) => {
            this.keys[input.code] = false;
            this.keyPressHistory[input.code] = clock.getElapsedTime();
            
            Object.keys(this.keyUpCallbacks).forEach(key => {
                this.keyUpCallbacks[key](input);                
            });      
        });
        window.addEventListener('mousemove', (input) => {
            this.lastMouseInput = input;
            
            Object.keys(this.mouseMovedCallbacks).forEach(key => {
                this.mouseMovedCallbacks[key](input);                
            });
        })
    }

    /**
     * @param {KeyboardEvent.code} code 
     */
    isKeyDown(code) {
        return !!this.keys[code];
    }

    /**
     * @param {KeyboardEvent.code} code 
     * @param {number} timePeriod
     */
    wasKeyDown(code, timePeriod) {
        return this.isKeyDown(code) || !!this.keyPressHistory[code] && this.clock.getElapsedTime() - this.keyPressHistory[code] <= timePeriod;
    }

    /**
     * @template {string} K
     * @param {(input: MouseEvent) => (void)} callback 
     * @param {K} name 
     * @returns {K}
     */
    mouseMoved(callback, name) {
        this.mouseMovedCallbacks[name] = callback;
        return name;
    }

    /**
     * @template {string} K
     * @param {(input: KeyboardEvent) => (void)} callback 
     * @param {K} name 
     * @returns {K}
     */
    onKeyDown(callback, name) {
        this.keyDownCallbacks[name] = callback;
        return name;
    }

    /**
     * @template {string} K
     * @param {(input: KeyboardEvent) => (void)} callback 
     * @param {K} name 
     * @returns {K}
     */
    onKeyUp(callback, name) {
        this.keyUpCallbacks[name] = callback;
        return name;
    }
}

export class CooldownManager {
    /**
     * @param {THREE.Clock} clock 
     */
    constructor(clock) {
        this.clock = clock;
        
        this.cooldownHistory = {};
    }

    /**
     * @param {string} name 
     * @param {number} duration 
     */
    setCooldown(name, duration) {
        this.cooldownHistory[name] = this.clock.getElapsedTime() + duration;
    }

    /**s
     * @param {string} name 
     * @returns {boolean}
     */
    onCooldown(name) {
        let cooldownEnd = this.cooldownHistory[name];
        if (!cooldownEnd) return false;
        return this.clock.getElapsedTime() < cooldownEnd;
    }
}

export class Randomizer {
    constructor() {}

    /**
     * @returns {number}
     */
    randomColor() {
        return Math.floor(Math.random() * (256 ** 3 - 1));
    }
}