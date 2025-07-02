// environment4.js
// Set-piece environment based on the provided layout description
import * as THREE from 'three';
import { collidableObjects } from './physics.js';
import { addToScene } from './main.js';
import { playerHeight, spawnPos } from './player.js';

// Spawn the player on the arrival gantry balcony
spawnPos.set(0, playerHeight + 4, -18);

export function environment4init() {
    let currentZ = 0;

    function addBox({ x = 0, y = 0, z = 0, w = 1, h = 1, d = 1, color = 0x777777 }) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y + h / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        collidableObjects.push(mesh);
        addToScene(mesh);
        return mesh;
    }

    function addCylinder({ x = 0, y = 0, z = 0, r = 1, h = 1, color = 0x888888, segments = 12 }) {
        const geo = new THREE.CylinderGeometry(r, r, h, segments);
        const mat = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y + h / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        collidableObjects.push(mesh);
        addToScene(mesh);
        return mesh;
    }

    function makeFloor(width, length, y, color) {
        return addBox({ x: 0, y: y - 0.5, z: currentZ, w: width, h: 1, d: length, color });
    }

    function connector(len) {
        currentZ += len;
    }

    // ---- 1. Freightlock Atrium ----
    const atriumW = 28, atriumL = 40;
    makeFloor(atriumW, atriumL, 0, 0x555555);

    // Arrival gantry balcony
    addBox({ w: atriumW, h: 1, d: 6, x: 0, y: 4, z: currentZ - atriumL / 2 + 3, color: 0x666666 });

    // pits staggered along the floor
    for (let i = 0; i < 4; i++) {
        const offset = -atriumL / 2 + 10 + i * 10;
        const x = (i % 2 === 0 ? -1 : 1) * (atriumW / 4);
        addBox({ w: 4, h: 2, d: 4, x, y: -2, z: currentZ + offset, color: 0x222222 });
    }

    // twin wall-run rails on east wall
    addBox({ w: 0.3, h: 2, d: 12, x: atriumW / 2 - 0.15, y: 1.5, z: currentZ - atriumL / 2 + 10, color: 0x999999 });
    addBox({ w: 0.3, h: 2, d: 12, x: atriumW / 2 - 0.15, y: 1.5, z: currentZ - atriumL / 2 + 24, color: 0x999999 });

    // overhead crane track
    addBox({ w: 1, h: 1, d: atriumL, x: 0, y: 18, z: currentZ, color: 0xffff00 });

    // exit blast door
    addBox({ w: 4, h: 8, d: 1, x: 0, y: 4, z: currentZ + atriumL / 2 - 0.5, color: 0x333333 });

    currentZ += atriumL;
    connector(6);

    // ---- 2. Mag-Lift Corridor ----
    const magW = 26, magL = 70;
    makeFloor(magW, magL, 0, 0x444444);

    // mag-lift rails
    addBox({ w: 0.5, h: 0.2, d: magL, x: -1, y: 0.1, z: currentZ, color: 0x00aaff });
    addBox({ w: 0.5, h: 0.2, d: magL, x: 1, y: 0.1, z: currentZ, color: 0x00aaff });

    // suspended shafts
    [20, 45].forEach(dist => {
        addBox({ w: 3, h: 8, d: 3, x: -magW / 2 + 1.5, y: 4, z: currentZ - magL / 2 + dist, color: 0x777777 });
    });

    // overhead duct lattice segments
    for (let z = -magL / 2 + 4; z < magL / 2; z += 16) {
        addBox({ w: magW, h: 0.3, d: 8, x: 0, y: 12, z: currentZ + z + 4, color: 0x888888 });
    }

    // side pillars
    for (let i = 0; i < 9; i++) {
        const zPos = currentZ - magL / 2 + 5 + i * 5;
        addCylinder({ r: 0.5, h: 3, x: 0, y: 0, z: zPos, color: 0x666666 });
    }

    // ventilation grille drop
    addBox({ w: 3, h: 0.2, d: 3, x: 0, y: -0.1, z: currentZ + magL / 2 - 1.5, color: 0x222222 });

    currentZ += magL;
    connector(6);

    // ---- 3. Service Shaft Stack ----
    const shaftW = 14, shaftL = 14;
    makeFloor(shaftW, shaftL, -1, 0x333333);

    // overflow pipes
    addCylinder({ r: 1, h: 11, x: -shaftW / 2 + 1, y: 0, z: currentZ, color: 0x555555 });
    addCylinder({ r: 1, h: 11, x: shaftW / 2 - 1, y: 0, z: currentZ, color: 0x555555 });

    // ledges ringing walls
    const ledgeLen = shaftW - 2;
    ['east', 'west'].forEach(dir => {
        const x = dir === 'east' ? shaftW / 2 - 0.5 : -shaftW / 2 + 0.5;
        addBox({ w: 1, h: 0.5, d: ledgeLen, x, y: 3, z: currentZ, color: 0x777777 });
    });
    ['north', 'south'].forEach(dir => {
        const z = dir === 'north' ? -shaftL / 2 + 0.5 : shaftL / 2 - 0.5;
        addBox({ w: ledgeLen, h: 0.5, d: 1, x: 0, y: 3, z: currentZ + z, color: 0x777777 });
    });

    // grav pad
    addCylinder({ r: 1.5, h: 0.2, x: -shaftW / 2 + 2, y: 0.1, z: currentZ - shaftL / 2 + 2, color: 0x00ffff });

    // mezzanine walkways
    addBox({ w: 2, h: 0.3, d: shaftL - 4, x: -shaftW / 2 + 2, y: 8, z: currentZ, color: 0x888888 });
    addBox({ w: 2, h: 0.3, d: shaftL - 4, x: shaftW / 2 - 2, y: 8, z: currentZ, color: 0x888888 });

    // ceiling hatch
    addBox({ w: 4, h: 0.2, d: 4, x: 0, y: 10, z: currentZ, color: 0x222222 });

    currentZ += shaftL;
    connector(6);

    // ---- 4. Orbital Hangar ----
    const hangarW = 38, hangarL = 90;
    makeFloor(hangarW, hangarL, 0, 0x666666);

    // gunship husks
    addBox({ w: 12, h: 3, d: 4, x: -10, y: 1.5, z: currentZ - 10, color: 0x333333 });
    addBox({ w: 12, h: 3, d: 4, x: -10, y: 1.5, z: currentZ + 10, color: 0x333333 });

    // beam network
    for (let z = -hangarL / 2; z <= hangarL / 2; z += 10) {
        addBox({ w: 4, h: 1, d: hangarW, x: 0, y: 8, z: currentZ + z, color: 0x999999 });
    }

    // light well
    addCylinder({ r: 3, h: 0.1, x: 0, y: 0.1, z: currentZ, color: 0x0000ff });

    // gantry cannon
    addBox({ w: 2, h: 2, d: 6, x: hangarW / 2 - 2, y: 18, z: currentZ + 20, color: 0xff0000 });

    // grav pads
    [-20, 0, 20].forEach(zOff => {
        addCylinder({ r: 1.5, h: 0.2, x: 0, y: 0.1, z: currentZ + zOff, color: 0x00ffff });
    });

    // exit door
    addBox({ w: 6, h: 5, d: 0.5, x: hangarW / 2 - 3, y: 16, z: currentZ + hangarL / 2 - 2.5, color: 0x444444 });

    currentZ += hangarL;
    connector(6);

    // ---- 5. Cryo-Tube Gallery ----
    const galleryW = 30, galleryL = 60;
    makeFloor(galleryW, galleryL, 0, 0x444444);

    // cryo pods
    const podW = 1.2, podL = 3;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 20; j++) {
            const x = i * (galleryW / 4) - galleryW / 2 + podW / 2;
            const z = currentZ - galleryL / 2 + j * (galleryL / 20) + podL / 2;
            addBox({ w: podW, h: 0.8, d: podL, x, y: 0, z, color: 0x88ccff });
        }
    }

    // magnet rails
    for (let j = 0; j < 8; j++) {
        const zPos = currentZ - galleryL / 2 + j * 8 + 4;
        addBox({ w: 2.5, h: 0.3, d: 0.3, x: galleryW / 2 - 0.15, y: 3, z: zPos, color: 0xaa0000 });
        addBox({ w: 2.5, h: 0.3, d: 0.3, x: -galleryW / 2 + 0.15, y: 3, z: zPos + 4, color: 0xaa0000 });
    }

    // ceiling vent turbines
    for (let i = 0; i < 4; i++) {
        const x = i % 2 === 0 ? -5 : 5;
        const z = currentZ - galleryL / 2 + (i + 1) * 12;
        addCylinder({ r: 2, h: 0.5, x, y: 16, z, color: 0x777777 });
    }

    // central spine conduit
    addBox({ w: 0.5, h: 0.5, d: galleryL, x: 0, y: 10, z: currentZ, color: 0xaaaaaa });

    // hydraulic lift
    addBox({ w: 3, h: 4, d: 3, x: 0, y: 0, z: currentZ + galleryL / 2 - 2, color: 0x666666 });

    currentZ += galleryL;
    connector(6);

    // ---- 6. Extraction Deck ----
    const deckW = 45, deckL = 45;
    makeFloor(deckW, deckL, 0, 0x333333);

    // H-shaped catwalk
    addBox({ w: deckL, h: 0.3, d: 1, x: 0, y: 16, z: currentZ, color: 0x777777 });
    addBox({ w: 1, h: 0.3, d: 22, x: 0, y: 16, z: currentZ, color: 0x777777 });
    addBox({ w: deckL, h: 0.3, d: 1, x: 0, y: 16, z: currentZ - 11, color: 0x777777 });
    addBox({ w: deckL, h: 0.3, d: 1, x: 0, y: 16, z: currentZ + 11, color: 0x777777 });

    // blast shields
    for (let i = -2; i <= 2; i++) {
        addBox({ w: 2, h: 2.5, d: 0.5, x: i * 4, y: 0, z: currentZ, color: 0x555555 });
    }

    // roof drop pods
    [-10, 0, 10].forEach(zOff => {
        addCylinder({ r: 1.5, h: 5, x: 0, y: 17.5, z: currentZ + zOff, color: 0x999999 });
    });

    // exit dropship
    addBox({ w: 8, h: 3, d: 12, x: 0, y: 3, z: currentZ + deckL / 2 - 6, color: 0x0000ff });

    // energy fence
    addBox({ w: deckW - 6, h: 2, d: 0.1, x: 0, y: 1, z: currentZ - deckL / 2 + 0.05, color: 0xff00ff });
    addBox({ w: deckW - 6, h: 2, d: 0.1, x: 0, y: 1, z: currentZ + deckL / 2 - 0.05, color: 0xff00ff });
    addBox({ w: 0.1, h: 2, d: deckL - 6, x: -deckW / 2 + 0.05, y: 1, z: currentZ, color: 0xff00ff });
    addBox({ w: 0.1, h: 2, d: deckL - 6, x: deckW / 2 - 0.05, y: 1, z: currentZ, color: 0xff00ff });

    //Lighting
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
