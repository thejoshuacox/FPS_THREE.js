// Open world environment with scattered obstacles
import * as THREE from 'three';
import { collidableObjects } from './physics.js';
import { addToScene } from './main.js';
import { spawnPos } from './player.js';

// Place player near the center of the world
spawnPos.set(0, 0, 5);

export function environmentinit() {
    // Directional light for the scene
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 250;
    directionalLight.shadow.camera.left = -125;
    directionalLight.shadow.camera.right = 125;
    directionalLight.shadow.camera.top = 125;
    directionalLight.shadow.camera.bottom = -125;
    addToScene(directionalLight);

    // Textures for the ground
    const floorTexture = new THREE.TextureLoader().load('Textures/granite_tile_diff_4k.jpg');
    const floorDisp = new THREE.TextureLoader().load('Textures/granite_tile_disp_4k.jpg');
    const floorRough = new THREE.TextureLoader().load('Textures/granite_tile_rough_4k.jpg');

    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(40, 40);
    floorDisp.wrapS = floorDisp.wrapT = THREE.RepeatWrapping;
    floorDisp.repeat.set(40, 40);
    floorRough.wrapS = floorRough.wrapT = THREE.RepeatWrapping;
    floorRough.repeat.set(40, 40);

    // Large open floor
    const floorGeometry = new THREE.BoxGeometry(200, 0.5, 200);
    const floorMaterial = new THREE.MeshStandardMaterial({
        map: floorTexture,
        bumpMap: floorDisp,
        roughnessMap: floorRough
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.position.y = -0.25;
    floor.userData.isGround = true; // flag to ignore in bot collisions
    collidableObjects.push(floor);
    addToScene(floor);

    // Simple randomly scattered obstacles
    const colors = [0x808080, 0x999999, 0x777777];
    for (let i = 0; i < 25; i++) {
        const size = 1 + Math.random() * 3;
        const geo = new THREE.BoxGeometry(size, size, size);
        const mat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length] });
        const box = new THREE.Mesh(geo, mat);
        box.castShadow = true;
        box.receiveShadow = true;
        box.position.set(
            (Math.random() - 0.5) * 180,
            size / 2,
            (Math.random() - 0.5) * 180
        );
        collidableObjects.push(box);
        addToScene(box);
    }
}
