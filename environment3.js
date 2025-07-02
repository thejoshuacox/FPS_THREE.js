// environment3.js
// Horizontally oriented multi-zone environment
import * as THREE from 'three';
import { collidableObjects } from './physics.js';
import { addToScene } from './main.js';
import { playerHeight, spawnPos } from './player.js';

spawnPos.set(0, playerHeight, -14);

export function environment3init() {
    const zoneWidth = 20;
    const zoneLength = 30;
    let currentZ = 0;

    function makeFloor(y, color) {
        const geo = new THREE.BoxGeometry(zoneWidth, 1, zoneLength);
        const mat = new THREE.MeshStandardMaterial({ color });
        const floor = new THREE.Mesh(geo, mat);
        floor.position.set(0, y - 0.5, currentZ);
        floor.receiveShadow = true;
        collidableObjects.push(floor);
        addToScene(floor);
        const z = currentZ; // capture for objects
        return { floor, z };
    }

    // ---- 1. Cargo Staging Bay ----
    const zone1 = makeFloor(0, 0x555555);
    for (let i = 0; i < 4; i++) {
        const crateGeo = new THREE.BoxGeometry(4, 4, 7);
        const crateMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const crate = new THREE.Mesh(crateGeo, crateMat);
        crate.position.set(
            (Math.random() - 0.5) * (zoneWidth - 4),
            2,
            zone1.z + (Math.random() - 0.5) * (zoneLength - 4)
        );
        crate.castShadow = true;
        crate. receiveShadow = true;
        collidableObjects.push(crate);
        addToScene(crate);
    }
    currentZ += zoneLength;

    // ---- 2. Grav-Lift Channel ----
    const zone2 = makeFloor(30, 0x333366);
    for (let i = -2; i <= 2; i++) {
        const jetGeo = new THREE.ConeGeometry(0.5, 2, 8);
        const jetMat = new THREE.MeshStandardMaterial({ color: 0x9999ff });
        const jet = new THREE.Mesh(jetGeo, jetMat);
        jet.position.set(i * 4, 32, zone2.z - zoneLength / 2 + 5);
        jet.rotation.x = Math.PI;
        collidableObjects.push(jet);
        addToScene(jet);
    }
    currentZ += zoneLength;

    // ---- 3. Maintenance Truss Garden ----
    const zone3 = makeFloor(20, 0xff6600);
    for (let i = -4; i <= 4; i += 2) {
        const beamGeo = new THREE.BoxGeometry(zoneWidth, 0.3, 0.3);
        const beam = new THREE.Mesh(beamGeo, zone3.floor.material);
        beam.position.set(0, 21.5, zone3.z - zoneLength / 2 + i * 1.5);
        beam.castShadow = true;
        collidableObjects.push(beam);
        addToScene(beam);
    }
    currentZ += zoneLength;

    // ---- 4. Plasma Coolant Spill ----
    const zone4 = makeFloor(10, 0x222244);
    for (let i = -1; i <= 1; i++) {
        const puddleGeo = new THREE.CircleGeometry(3, 16);
        const puddleMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x007777 });
        const puddle = new THREE.Mesh(puddleGeo, puddleMat);
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.set(i * 6, 10.01, zone4.z - zoneLength / 3);
        collidableObjects.push(puddle);
        addToScene(puddle);
    }
    currentZ += zoneLength;

    // ---- 5. Signal Relay Gauntlet ----
    const zone5 = makeFloor(0, 0x444444);
    for (let i = -2; i <= 2; i++) {
        const panelGeo = new THREE.BoxGeometry(0.5, 4, 4);
        const panelMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(i * 4, 2, zone5.z);
        panel.castShadow = true;
        collidableObjects.push(panel);
        addToScene(panel);
    }
    currentZ += zoneLength;

    // ---- 6. Sunset Debris Hall ----
    const zone6 = makeFloor(-20, 0x666666);
    const light = new THREE.DirectionalLight(0xffddaa, 2.5);
    light.position.set(-10, 200, 100);
    light.castShadow = true;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 1000;
    light.shadow.camera.left = -50;
    light.shadow.camera.right = 50;
    light.shadow.camera.top = 30;
    light.shadow.camera.bottom = -30;
    addToScene(light);
    const lightDown = new THREE.DirectionalLight(0xffddaa, 2.5);
    lightDown.position.set(0, 600, 0);
    lightDown.castShadow = true;
    lightDown.shadow.mapSize.width = 4096;
    lightDown.shadow.mapSize.height = 4096;
    lightDown.shadow.camera.near = 1;
    lightDown.shadow.camera.far = 1000;
    lightDown.shadow.camera.left = -50;
    lightDown.shadow.camera.right = 50;
    lightDown.shadow.camera.top = 30;
    lightDown.shadow.camera.bottom = -300;
    addToScene(lightDown);
}

