//~ Public API

export class InputHandler {
    constructor(clock) {
        this.clock = clock;
        
        this.keys = {};
        this.keyPressHistory = {};
        
        window.addEventListener('keydown', (input) => { 
            this.keys[input.code] = true;
            this.keyPressHistory[input.code] = clock.getElapsedTime();
        });
        window.addEventListener('keyup', (input) => {
            this.keys[input.code] = false;
            this.keyPressHistory[input.code] = clock.getElapsedTime();
        });
    }

    isKeyDown(code) {
        return !!this.keys[code];
    }

    wasKeyDown(code, timePeriod) {
        return this.isKeyDown(code) || !!this.keyPressHistory[code] && this.clock.getElapsedTime() - this.keyPressHistory[code] <= timePeriod;
    }
}

export class Randomizer {
    constructor() {}

    randomColor() {
        return Math.floor(Math.random() * (256 ** 3 - 1));
    }
}