//~ Imports

import * as THREE from 'three';
import { Config } from '../core/config.js'
import { State } from '../core/state.js';

//~ Public API

export class World {
	/**
	 * @param {THREE.scene} scene
	 */
	constructor(scene) {
		this.scene = scene;

		this.createRayCollider();
		this.createBaseplate();
		this.setupLights();
	}

	setupLights() {
		let ambient = new THREE.AmbientLight(0xffffff, 0.4);
		this.scene.add(ambient);

		let sun = new THREE.DirectionalLight(0xffffff, 0.85);
		sun.position.set(10, 20, 10);
		sun.castShadow = true;

		sun.shadow.mapSize.set(1024, 1024);
		sun.shadow.camera.left = -Config.VIEW_SIZE;
		sun.shadow.camera.right = Config.VIEW_SIZE;
		sun.shadow.camera.top = Config.VIEW_SIZE;
		sun.shadow.camera.bottom = -Config.VIEW_SIZE;
		sun.shadow.camera.near = 0.5;
		sun.shadow.camera.far = 500;
		sun.shadow.camera.updateProjectionMatrix();

		this.scene.add(sun);

		this.sun = sun;
	}

	createBaseplate() {
		let geometry = new THREE.PlaneGeometry(Config.MAP_SIZE, Config.MAP_SIZE);
		let material = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.1, 1, 0.2) });
		this.floor = new THREE.Mesh(geometry, material);

		this.floor.rotation.x = -Math.PI / 2;
		this.floor.receiveShadow = true;
		this.scene.add(this.floor);

		let grid = new THREE.GridHelper(Config.MAP_SIZE, Config.MAP_SIZE, new THREE.Color().setRGB(0, 0.23, 0.1), new THREE.Color().setRGB(0.08, 0.8, 0.15));
		this.scene.add(grid);
	}

	createRayCollider() {
		let geometry = new THREE.PlaneGeometry(Config.MAP_SIZE * 2, Config.MAP_SIZE * 2);
		let material = new THREE.MeshStandardMaterial({ opacity: 0, transparent: true, depthWrite: false });
		this.collider = new THREE.Mesh(geometry, material);

		this.collider.rotation.x = -Math.PI / 2;
		this.collider.position.y += 1;
		this.scene.add(this.collider);
	}

	update() {
		let player = State.Player && State.Player.mesh;
		let camera = State.Camera;
		if (!player || !camera) return;

		this.sun.position.set(player.position.x - 10, player.position.y + 40, player.position.z + 10);
		this.sun.target.position.copy(player.position);
		this.sun.target.updateMatrixWorld();
	}
}