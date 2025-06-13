// Import Three.js
import * as THREE from 'three';

// Player sizing and spawn info
export const playerSize = new THREE.Vector3(1, 2, 1);
export const playerHeight = 2;
export const spawnPos = new THREE.Vector3(0, playerHeight, 5);
export const playerBBox = new THREE.Box3();

// Temporary cube model used as the player
class Cube {
    constructor({ x = 0, y = 2.5, z = -5, w = 6, h = 5, d = 1 } = {}) {
        const cubeGeometry = new THREE.BoxGeometry(w, h, d);
        this.object = new THREE.Mesh(cubeGeometry);
        this.object.castShadow = true;
        this.object.receiveShadow = true;
        this.object.position.set(x, y, z);
    }
}

export const playerModel = new Cube({
    x: spawnPos.x - playerSize.x / 2,
    y: spawnPos.y - playerSize.y / 2,
    z: spawnPos.z - playerSize.z / 2,
    w: playerSize.x,
    h: playerSize.y,
    d: playerSize.z
});

// Add the player to the provided scene
export function addPlayerToScene(scene) {
    playerModel.object.material.colorWrite = false;
    playerModel.object.material.depthWrite = false;
    playerModel.object.material.polygonOffset = true;
    scene.add(playerModel.object);
}
