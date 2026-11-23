//~ Imports

import * as THREE from 'three';
import { State } from '../core/state.js';

//~ Types

/**
 * @typedef {{
 *  x: number,
 *  y: number,
 *  z: number,
 *  radius: number,
 *  color?: THREE.Color,
 *  emissiveIntensity?: number,
 *  startOpacity?: number,
 *  duration?: number,
 *  onHit?: (playerId: string) => void
 * }} ExplosionData
 */

//~ Public Methods

/**
 * @param {ExplosionData} data
 */
export function Explosion(data) {
    let geometry = new THREE.SphereGeometry(1, 16, 16);
    let material = new THREE.MeshStandardMaterial({
        color: data.color || new THREE.Color().setRGB(1, 0.3, 0),
        transparent: true,
        opacity: data.startOpacity || 0.8,
        emissive: data.color || new THREE.Color().setRGB(1, 0.3, 0),
        emissiveIntensity: data.emissiveIntensity || 6,
        depthWrite: false,
    });

    let explosionMesh = new THREE.Mesh(geometry, material);
    explosionMesh.position.set(data.x, data.y, data.z);
    
    State.World.scene.add(explosionMesh);

    let startTime = performance.now();
    let duration = data.duration || 400;
    
    /** @type {Set<string>} */
    let hitPlayers = new Set();

    let update = (currentTime) => {
        let elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / duration, 1.0);

        let currentScale = data.radius * progress;
        explosionMesh.scale.set(currentScale, currentScale, currentScale);

        material.opacity = (data.startOpacity || 0.8) * (1.0 - progress);

        if (data.onHit) {
            Object.keys(State.Players).forEach(playerId => {
                let player = State.Players[playerId];
                if (!player || !player.Mesh || hitPlayers.has(playerId)) return;

                let dx = player.Mesh.position.x - data.x;
                let dy = player.Mesh.position.y - data.y;
                let dz = player.Mesh.position.z - data.z;
                let distance = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);

                if (distance <= currentScale) {
                    hitPlayers.add(playerId);
                    console.log(`Explosion hit player: ${playerId}!`);
                    data.onHit(playerId);
                }
            });
        }

        if (progress < 1.0) {
            requestAnimationFrame(update);
        } else {
            State.World.scene.remove(explosionMesh);
            geometry.dispose();
            material.dispose();
        }
    };

    requestAnimationFrame(update);
}