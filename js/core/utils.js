//~ Imports

import * as THREE from 'three';

//~ Public API

export class InputHandler {
    constructor(clock) {
        this.clock = clock;
        
        this.keys = {};
        this.keyPressHistory = {};
        this.mouseMovedCallbacks = {};

        this.lastMouseInput = null;
        
        window.addEventListener('keydown', (input) => {
            this.keys[input.code] = true;
            this.keyPressHistory[input.code] = clock.getElapsedTime();
        });
        window.addEventListener('keyup', (input) => {
            this.keys[input.code] = false;
            this.keyPressHistory[input.code] = clock.getElapsedTime();
        });
        window.addEventListener('mousemove', (input) => {
            this.lastMouseInput = input;
            
            Object.keys(this.mouseMovedCallbacks).forEach(key => {
                this.mouseMovedCallbacks[key](input);                
            });
        })
    }

    isKeyDown(code) {
        return !!this.keys[code];
    }

    wasKeyDown(code, timePeriod) {
        return this.isKeyDown(code) || !!this.keyPressHistory[code] && this.clock.getElapsedTime() - this.keyPressHistory[code] <= timePeriod;
    }

    mouseMoved(callback, name) {
        this.mouseMovedCallbacks[name] = callback;
        return name;
    }
}

export class Randomizer {
    constructor() {}

    randomColor() {
        return Math.floor(Math.random() * (256 ** 3 - 1));
    }
}