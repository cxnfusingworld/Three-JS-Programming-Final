//~ Imports

import * as THREE from 'three';
import { State } from "./state.js"

//~ Types

/**
 * @typedef {{
 *  x: number,
 *  y: number,
 *  z: number,
 *  radius: number
 * }} ExplosionData
 */

/**
 * @typedef {{
 *  Explosion: ExplosionData,
 * }} EffectPayloadMap
 */

//~ Public API

class EffectRegistryCreator {
    constructor() {
        this.effects = {
            /**
             * @param {ExplosionData} data
             */
            "Explosion": (data) => {
                const geometry = new THREE.SphereGeometry(1, 16, 16);
                const material = new THREE.MeshStandardMaterial({
                    color: 0xff5500,
                    transparent: true,
                    opacity: 0.8,
                    emissive: 0xff5500,
                    emissiveIntensity: 6,
                });

                const explosionMesh = new THREE.Mesh(geometry, material);
                explosionMesh.position.set(data.x, data.y, data.z);
                
                State.World.scene.add(explosionMesh);

                const startTime = performance.now();
                const duration = 400;

                const animateExplosion = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1.0);

                    const currentScale = data.radius * progress;
                    explosionMesh.scale.set(currentScale, currentScale, currentScale);

                    material.opacity = 0.8 * (1.0 - progress);

                    if (progress < 1.0) {
                        requestAnimationFrame(animateExplosion);
                    } else {
                        State.World.scene.remove(explosionMesh);
                        geometry.dispose();
                        material.dispose();
                    }
                };

                requestAnimationFrame(animateExplosion);
            }
        };
    }
}

export const EffectRegistry = new EffectRegistryCreator();