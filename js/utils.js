//~ Public API

export class InputHandler {
    constructor() {
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    isKeyDown(code) {
        return !!this.keys[code];
    }
}

//~ Public Methods

export function randomColor() {
    return Math.floor(Math.random() * (256 ** 3 - 1));
}