//~ Imports

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { CooldownManager, InputHandler } from './js/core/utils.js';
import { State } from './js/core/state.js';
import { DataManager } from './js/core/data.js';
import { Config } from './js/core/config.js';
import { AbilityHandler } from './js/core/abilityHandler.js';

import { World } from './js/classes/world.js';
import { Player } from './js/classes/player.js';

import './js/core/net.js';
import './js/core/sync.js';
import './js/core/ui.js';

//~ Constants

const aspectRatio = window.innerWidth / window.innerHeight;

const clock = new THREE.Clock();

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-Config.VIEW_SIZE * aspectRatio, Config.VIEW_SIZE * aspectRatio, Config.VIEW_SIZE, -Config.VIEW_SIZE, 0.1, 10000);

const renderer = new THREE.WebGLRenderer({ antialias: true });

const input = new InputHandler(clock);
const cooldownManager = new CooldownManager(clock)
const world = new World(scene, camera);
const player = new Player(scene, input, camera, world.floor);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0, 1);
const outputPass = new OutputPass();
const composer = new EffectComposer(renderer);

//~ Helper Functions

function animate() {
	requestAnimationFrame(animate);

	let dt = clock.getDelta();
	dt = Math.min(dt, 0.1);

	State.DeltaTime = dt;

	AbilityHandler.update(dt);

	player.update(dt);
	world.update(dt);

	camera.position.set(player.mesh.position.x + 20, 20, player.mesh.position.z + 20);
	camera.lookAt(new THREE.Vector3(player.mesh.position.x, 1, player.mesh.position.z));

	composer.render();
}

//~ Main

State.Scene = scene;
State.World = world;
State.Clock = clock;
State.Camera = camera;
State.Player = player;
State.Input = input;
State.DataManager = DataManager;
State.CooldownManager = cooldownManager;

scene.background = new THREE.Color().setRGB(0.02, 0.02, 0.05);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

document.body.appendChild(renderer.domElement);

animate();

window.addEventListener('resize', () => {
	const newAspectRatio = window.innerWidth / window.innerHeight;

	camera.left = -Config.VIEW_SIZE * newAspectRatio;
	camera.right = Config.VIEW_SIZE * newAspectRatio;
	camera.top = Config.VIEW_SIZE;
	camera.bottom = -Config.VIEW_SIZE;

	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);
});