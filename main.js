//~ Imports

import * as THREE from 'three';
import { InputHandler } from './js/utils.js';
import { World } from './js/world.js';
import { Player } from './js/player.js';

//~ Constants

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e222a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const input = new InputHandler();
const world = new World(scene);
const player = new Player(scene, input);

const clock = new THREE.Clock();

//~ Helper Functions

function animate() {
    requestAnimationFrame(animate);
    
    const dt = clock.getDelta();
    player.update(dt);

    renderer.render(scene, camera);
}

//~ Main

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});