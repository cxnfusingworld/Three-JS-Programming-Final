//~ Imports

import * as THREE from 'three';

//~ Public API

export class World {
    constructor(scene) {
        this.scene = scene;

        this.createBaseplate();
        this.setupLights();

        return this.floor
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(10, 20, 10);
        sun.castShadow = true;
        this.scene.add(sun);
    }

    createBaseplate() {
        const geometry = new THREE.PlaneGeometry(1000, 1000);
        const material = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.1, 1, 0.2) });
        this.floor = new THREE.Mesh(geometry, material);
        
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);

        const grid = new THREE.GridHelper(1000, 1000, new THREE.Color().setRGB(0, 0.23, 0.1), new THREE.Color().setRGB(0.08, 0.8, 0.15));
        this.scene.add(grid);
    }
}