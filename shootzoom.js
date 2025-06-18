// Import Three.js
import * as THREE from 'three';

import {moveControls, zoomControls} from './controls.js'
import { collidableObjects } from './physics.js';
import { addToScene } from './main.js';

// Constants/Attributes
export const originalFOV = 75;
export const zoomedFOV = 40;
export const zoomDuration = 0.1;    // seconds

const zoomedcrosshair = document.getElementById('zoomedcrosshair');
const widecrosshair = document.getElementById('widecrosshair');
const vignette = document.getElementById('vignette-general');
const vignetteZoomed = document.getElementById('vignette-zoomed');

// For simulating Recoil
const recoilQuaternion = new THREE.Quaternion(); // Used to create recoil
const recoilAngle = 0.01;
recoilQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0,0), recoilAngle);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Variables for marking decals where you shoot
const markGeometry = new THREE.PlaneGeometry(.1,.1);
const markTexture = new THREE.TextureLoader().load('Textures/bullet-holes.png');
const markMaterial = new THREE.MeshStandardMaterial({ map: markTexture, transparent: true, side: THREE.DoubleSide});

// Implementation of shooting
export function shoot() {
    const shootableObjects = collidableObjects; // Objects that can be shot. For now, will be all collidable objects

    // Ray originates from the camera, pointing forward
    // We don't need mouse.x, mouse.y since we're shooting straight ahead from the camera's perspective
    // In a typical FPS, the center of the screen is (0,0) in normalized device coordinates.
    mouse.set(0,0); 
    
    // Raycaster points from camera outward
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(shootableObjects, true); // true to also check children
    if (intersects.length > 0) {
        const hit = intersects[0]; 
        createMark(hit.point, hit.face.normal, hit.object);
    }

    // Simulate recoil
    camera.quaternion.multiply(recoilQuaternion);
    if(zoomControls.zoomedIn){
        camera.fov += 5;
        zoomControls.currentFOV = camera.fov;
        zoomControls.zoomingIn = true;
        zoomControls.zoomStartTime = performance.now();
    }

}

export function zoomIn() {
    zoomedcrosshair.style.display = 'block';
    widecrosshair.style.display = 'none';
    vignetteZoomed.style.display = 'block';
    vignette.style.display = 'none';
    
    zoomControls.currentFOV = camera.fov;
    zoomControls.zoomingIn = true;
    zoomControls.zoomingOut = false;
    zoomControls.zoomedIn = true;
    zoomControls.zoomedOut = false;
    zoomControls.zoomStartTime = performance.now();
}

export function zoomOut() {
    zoomedcrosshair.style.display = 'none';
    widecrosshair.style.display = 'block';
    vignetteZoomed.style.display = 'none';
    vignette.style.display = 'block';
    
    
    zoomControls.currentFOV = camera.fov;
    zoomControls.zoomingOut = true;
    zoomControls.zoomingIn = false;
    zoomControls.zoomedIn = false;
    zoomControls.zoomedOut = true;
    zoomControls.zoomStartTime = performance.now();
}

// All this offset stuff is to try and avoid the bullet holes overlapping eachother and looking like they're clipping
let offsetAmount = 0.001;
let offsetBase = 0;
const offsetShift = 0.0001;
function createMark(position, normal, hitObject) {
    if (offsetAmount > 0.01) {
        offsetBase += offsetShift;
        offsetAmount = offsetBase;
    }

    // Let's just place a small sphere for now to represent a bullet mark.
    // You could load a texture and create a plane that aligns with the surface normal.

    const mark = new THREE.Mesh(markGeometry, markMaterial);

    // Position the mark at the hit point, slightly offset along the surface normal
    // so it doesn't clip into the surface.
    const offset = normal.clone().multiplyScalar(offsetAmount);
    mark.position.copy(position).add(offset);
    offsetAmount+=0.0005;
    
    // Allign decal so that it faces in the direction of the hitpoint normal
    const lookAtPoint = new THREE.Vector3().addVectors(mark.position, normal);
    mark.lookAt(lookAtPoint);

    addToScene(mark);
}