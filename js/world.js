//~ Imports

import * as THREE from 'three';

//~ Public API

export class World {
    constructor(scene) {
        this.scene = scene;
        this.setupLights();
        this.createBaseplate();
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
        const geometry = new THREE.PlaneGeometry(30, 30);
        const material = new THREE.MeshStandardMaterial({ color: 0x2e3440 });
        this.floor = new THREE.Mesh(geometry, material);
        
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);

        const grid = new THREE.GridHelper(30, 30, 0x88c0d0, 0x4c566a);
        this.scene.add(grid);
    }
}