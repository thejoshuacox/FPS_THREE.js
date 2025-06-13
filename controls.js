// Import Three.js
import * as THREE from 'three';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';

import {shoot, zoomIn, zoomOut} from './shootzoom.js'

let canLockPointer = true;

let firstClick = 0; // To keep from shooting when first clicking into the scene- temporary fix

export const moveControls = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jumping: false,
    canJump: true
};

export const zoomControls = {
    currentFOV: 0,
    zoomingIn: false,
    zoomingOut: false,
    zoomedIn: false,
    zoomedOut: true,
    zoomStartTime: performance.now()
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);
document.addEventListener('pointerlockerror', onPointerLockError, false);
document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mouseup', onMouseUp, false);


// Initialization of all event listeners and pointer lock management
export function controlsinit(camera, renderer) {

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    window.camera = camera;
    window.renderer = renderer;

    // Initialize controls
    const controls = new PointerLockControls(camera, document.body);

    // Hide context menu on right-click
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
      });

    // Event listener to lock pointer on click
    document.addEventListener('click', () => {
        if(canLockPointer){
            controls.lock();
            canLockPointer = false; // Prevent immediate re-locking
        }
    }, false);

    // Handle lock state change
    controls.addEventListener('lock', () => {
        console.log('Pointer locked');
    });

    controls.addEventListener('unlock', () => {
        console.log('Pointer unlocked');
    });

    document.addEventListener('pointerlockchange', function () {
        if (document.pointerLockElement === document.body) {
            // Pointer is locked
            controls.enabled = true;
        } else {
            // Pointer is unlocked
            controls.enabled = false;
    
            // Allow re-locking after a short delay
            setTimeout(() => {
                canLockPointer = true;
            }, 1500); // Delay in milliseconds (adjust as needed)
        }
    }, false);

    return {controls};
}

function onWindowResize(evt) {
    evt.currentTarget.camera.aspect = window.innerWidth / window.innerHeight;
    evt.currentTarget.camera.updateProjectionMatrix();
    evt.currentTarget.renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerLockError(event) {
    console.error('Timeout: Unable to use Pointer Lock API');
}


function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
            moveControls.moveForward = true;
            break;
        case 'KeyS':
            moveControls.moveBackward = true;
            break;
        case 'KeyA':
            moveControls.moveLeft = true;
            break;
        case 'KeyD':
            moveControls.moveRight = true;
            break;
        case 'Space':
            if (moveControls.canJump === true) moveControls.jumping = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
            moveControls.moveForward = false;
            break;
        case 'KeyS':
            moveControls.moveBackward = false;
            break;
        case 'KeyA':
            moveControls.moveLeft = false;
            break;
        case 'KeyD':
            moveControls.moveRight = false;
            break;
    }
}


// Click functionality (shooting & zooming)
function onMouseDown(event) {
    if (event.button === 0) { // Left click
        if(firstClick>0)
            shoot();
        else
            firstClick++;
    }

    if (event.button === 2) {
        zoomIn();
    }
}
function onMouseUp(event) {
    if (event.button === 2) {
        zoomOut();
    }
}