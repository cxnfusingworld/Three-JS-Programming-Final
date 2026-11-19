//~ Imports

import * as THREE from 'three';

//~ Constants



//~ Public API

export class Sword {
    constructor(scene, player, input, camera, world) {
        this.scene = scene;
        this.player = player;
        this.input = input;
        this.camera = camera;
        this.world = world;

	    this.raycaster = new THREE.Raycaster();
		this.pointer = new THREE.Vector2();
        this.lookDir = new THREE.Vector3();

        const geometry = new THREE.ConeGeometry(0.1, 2.5);
        geometry.rotateX(THREE.MathUtils.degToRad(90));

        const material = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setRGB(1, 0.5, 0),
            emissive: new THREE.Color().setRGB(1, 0.5, 0),
            emissiveIntensity: 3,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        
        this.mesh.position.set(0, 1, 0);
        this.mesh.rotateX(THREE.MathUtils.degToRad(90));
        this.mesh.castShadow = true;
        scene.add(this.mesh);
    }

    //~ Public Methods

    update(dt) {
        this.mesh.position.copy(this.player.mesh.position);
        
        let lastMouseInput = this.input.lastMouseInput;
        if (!lastMouseInput) return;

        this.pointer.set(
            (lastMouseInput.clientX / window.innerWidth) * 2 - 1, 
            -(lastMouseInput.clientY / window.innerHeight) * 2 + 1
        );
        this.raycaster.setFromCamera(this.pointer, this.camera);

        let intersects = this.raycaster.intersectObjects([this.world], false);

        if (intersects.length > 0) {
            let hitPosition = intersects[0].point;
            if (!hitPosition) return;
        
            this.mesh.lookAt(hitPosition.x, this.mesh.position.y, hitPosition.z);

            this.mesh.getWorldDirection(this.lookDir);
            this.mesh.position.addScaledVector(this.lookDir, 2);
        }
    }
}