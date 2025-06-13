// Import Three.js
import * as THREE from 'three';

import { collidableObjects, addToScene } from './main.js';

class Wall {
    constructor({x=0, y=2.5, z=-5, w=6, h=5, d=1} = {}){

        // Create the wall texture
        const wallDiff = new THREE.TextureLoader().load('Textures/red_brick_diff_1k.jpg');
        const wallDisp = new THREE.TextureLoader().load('Textures/red_brick_disp_1k.jpg');
        const wallRough = new THREE.TextureLoader().load('Textures/red_brick_rough_1k.jpg');
        // Create the wall material
        const wallMaterial = new THREE.MeshStandardMaterial({ map: wallDiff, bumpMap: wallDisp, roughnessMap: wallRough });
        //wallMaterial.envMapIntensity = mapIntensity;
        // Create Wall geometry
        const wallGeometry = new THREE.BoxGeometry(w, h, d);

        // Create the wall mesh
        this.object = new THREE.Mesh(wallGeometry, wallMaterial);
        this.object.castShadow = true;
        this.object.receiveShadow = true;

        // Position the wall
        this.object.position.set(x, y,z);
    }
}

// Initialization of all event listeners and pointer lock management
export function environmentinit() {
    // Add a cube to the scene
    const geometry1 = new THREE.SphereGeometry(1, 70, 70); // Create a cube geometry
    const material1 = new THREE.MeshStandardMaterial({ color: 0x707070, roughness: 0, metalness: 1, }); // Use MeshBasicMaterial which doesn't require lighting
    const cube1 = new THREE.Mesh(geometry1, material1); // Create a mesh from the geometry and material
    cube1.castShadow = true;
    cube1.receiveShadow = true;
    cube1.position.x = 2;
    cube1.position.y = 1.5;
    cube1.position.z = 0;
    collidableObjects.push(cube1);
    addToScene(cube1); // Add the cube to the scene
    
    // Add a cube to the scene
    const geometry2 = new THREE.BoxGeometry(1, 2, 1); // Create a cube geometry
    const material2 = new THREE.MeshStandardMaterial({ color: 0xc0b070, roughness: .5, metalness: 0 }); // Use MeshBasicMaterial which doesn't require lighting
    const cube2 = new THREE.Mesh(geometry2, material2); // Create a mesh from the geometry and material
    cube2.castShadow = true;
    cube2.receiveShadow = true;
    cube2.position.x = 0;
    cube2.position.y = 1.5;
    cube2.position.z = 0;
    collidableObjects.push(cube2);
    addToScene(cube2); // Add the cube to the scene
    
    // Add a cube to the scene
    const geometry3 = new THREE.BoxGeometry(1, 2, 1); // Create a cube geometry
    const material3 = new THREE.MeshStandardMaterial({ color: 0xc0b070, roughness: 1, metalness: 0 }); // Use MeshBasicMaterial which doesn't require lighting
    const cube3 = new THREE.Mesh(geometry3, material3); // Create a mesh from the geometry and material
    cube3.castShadow = true;
    cube3.position.x = 4;
    cube3.position.y = 1.5;
    cube3.position.z = 0;
    collidableObjects.push(cube3);
    addToScene(cube3); // Add the cube to the scene

    // Add ambient light
    //const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    //scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(20, 25, 14);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    addToScene(directionalLight);

    // Create the floor texture
    const floorTexture = new THREE.TextureLoader().load("Textures/granite_tile_diff_4k.jpg");
    const floorDisp = new THREE.TextureLoader().load("Textures/granite_tile_disp_4k.jpg");
    const floorRough = new THREE.TextureLoader().load("Textures/granite_tile_rough_4k.jpg");

    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(9,9);
    floorDisp.wrapS = THREE.RepeatWrapping;
    floorDisp.wrapT = THREE.RepeatWrapping;
    floorDisp.repeat.set(9,9);
    floorRough.wrapS = THREE.RepeatWrapping;
    floorRough.wrapT = THREE.RepeatWrapping;
    floorRough.repeat.set(9,9);
    
    // Create the floor geometry and material
    const floorGeometry = new THREE.BoxGeometry(60, 0.5, 60);
    const floorMaterial = new THREE.MeshStandardMaterial({roughnessMap: floorRough, bumpMap: floorDisp, map: floorTexture });

    // Create the floor mesh
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    //floor.castShadow = true;
    floor.receiveShadow = true;
    floor.envMapIntensity = 0;

    // Rotate the floor to be horizontal
    //floor.rotation.x = Math.PI / 2;

    // Position the floor
    floor.position.y = -0.25;

    //Add the floor to collison checker
    collidableObjects.push(floor);

    // Add the floor to the scene
    addToScene(floor);

    /* Add a void
    const voidGeometry = new THREE.PlaneGeometry(10000, 10000);
    const voidMaterial = new THREE.MeshBasicMaterial({color: 0x003080});
    const voidSpace = new THREE.Mesh(voidGeometry, voidMaterial);
    voidSpace.receiveShadow = true;
    voidSpace.rotation.x = -Math.PI / 2;
    voidSpace.position.y = -100;
    scene.add(voidSpace); */

    // Add walls
    const wall1 = new Wall();
    const wall2 = new Wall(({x: 10}));
    collidableObjects.push(wall1.object);
    collidableObjects.push(wall2.object);
    // Add the wall to the scene
    addToScene(wall1.object);
    addToScene(wall2.object);
}