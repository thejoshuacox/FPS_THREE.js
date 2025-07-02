// environment2.js
// A multi-tier environment for the demo
import * as THREE from 'three';
import { collidableObjects } from './physics.js';
import { addToScene } from './main.js';

export function environment2init() {
    // Base values
    const tier0Y = 0;       // Foundation Grid height
    const tier1Y = tier0Y + 12;
    const tier2Y = tier0Y + 25;
    const tier3Y = tier0Y + 40;

    // ---- Tier 0 : Foundation Grid ----
    const tileSize = 4;
    const gridCount = 5; // 5x5 grid
    const half = (gridCount - 1) * tileSize / 2;
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x99ccff,
        opacity: 0.6,
        transparent: true
    });
    for (let i = 0; i < gridCount; i++) {
        for (let j = 0; j < gridCount; j++) {
            const tileGeo = new THREE.BoxGeometry(tileSize - 0.2, 0.5, tileSize - 0.2);
            const tile = new THREE.Mesh(tileGeo, glassMat);
            tile.position.set(i * tileSize - half, tier0Y, j * tileSize - half);
            tile.receiveShadow = true;
            collidableObjects.push(tile);
            addToScene(tile);
        }
    }
    // Corner hazard turrets
    const turretGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 12);
    const turretMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const turretOffsets = [half, -half];
    turretOffsets.forEach(x => {
        turretOffsets.forEach(z => {
            const turret = new THREE.Mesh(turretGeo, turretMat);
            turret.position.set(x, tier0Y + 0.75, z);
            turret.castShadow = true;
            collidableObjects.push(turret);
            addToScene(turret);
        });
    });

    // ---- Tier 1 : Garden Middle ----
    const gardenRadius = 18;
    const podGeo = new THREE.CylinderGeometry(2, 2, 1, 16);
    const podMat = new THREE.MeshStandardMaterial({ color: 0x00aa00 });
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const pod = new THREE.Mesh(podGeo, podMat);
        pod.position.set(Math.cos(angle) * gardenRadius, tier1Y, Math.sin(angle) * gardenRadius);
        pod.castShadow = true;
        pod.receiveShadow = true;
        collidableObjects.push(pod);
        addToScene(pod);
    }
    const walkwayGeo = new THREE.BoxGeometry(gardenRadius * 2, 0.4, 2);
    const walkwayMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const walkway1 = new THREE.Mesh(walkwayGeo, walkwayMat);
    walkway1.position.set(0, tier1Y, 0);
    walkway1.receiveShadow = true;
    collidableObjects.push(walkway1);
    addToScene(walkway1);
    const walkway2 = walkway1.clone();
    walkway2.rotation.y = Math.PI / 2;
    collidableObjects.push(walkway2);
    addToScene(walkway2);

    // ---- Tier 2 : Luminary Ring ----
    const ringGeo = new THREE.TorusGeometry(gardenRadius + 5, 1, 8, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xffffaa });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = tier2Y;
    ring.rotation.x = Math.PI / 2;
    collidableObjects.push(ring);
    addToScene(ring);
    const sculptureGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const sculptureMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x555555 });
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const s = new THREE.Mesh(sculptureGeo, sculptureMat);
        s.position.set(Math.cos(angle) * (gardenRadius + 5), tier2Y + 2, Math.sin(angle) * (gardenRadius + 5));
        s.castShadow = true;
        collidableObjects.push(s);
        addToScene(s);
    }

    // ---- Tier 3 : Celestial Capstone ----
    const catwalkGeo = new THREE.BoxGeometry(2, 0.3, gardenRadius * 2);
    const catwalkMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    for (let i = 0; i < 3; i++) {
        const catwalk = new THREE.Mesh(catwalkGeo, catwalkMat);
        catwalk.position.set((i - 1) * 6, tier3Y, 0);
        catwalk.castShadow = true;
        catwalk.receiveShadow = true;
        collidableObjects.push(catwalk);
        addToScene(catwalk);
    }

    // Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(20, tier3Y + 20, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    addToScene(directionalLight);
}
