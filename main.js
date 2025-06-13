// main.js

// Import Three.js
import * as THREE from 'three';

// Import local files
import {sceneinit} from './scene.js';
import {controlsinit, moveControls, zoomControls} from './controls.js';
import { addPlayerToScene, spawnPos } from './player.js';
import { updatePhysics } from './physics.js';
import {environmentinit} from './environment.js';
import { originalFOV, zoomDuration, zoomedFOV } from './shootzoom.js';

const clock = new THREE.Clock();
// Initialize the scene
const {scene, camera, renderer} = sceneinit(originalFOV, spawnPos);
const {controls} = controlsinit(camera, renderer);
init();
animate();

function init() {
    addPlayerToScene(scene);
}

export function addToScene(obj){
    scene.add(obj);
}

environmentinit();

function animate() {
    requestAnimationFrame(animate);

    
    //moveControls = returnValues();

    // time inbetween frames
    const delta = clock.getDelta();

    // Movement and control updates
    if (controls.isLocked === true) {

        // Zooming animation
        const now = performance.now();
        if(zoomControls.zoomingIn){
            const howFar = (now-zoomControls.zoomStartTime) / (zoomDuration * 1000); // Measuring how far along we are %-wise

            // Linear interpolation from zoomed out to in
            camera.fov = THREE.MathUtils.lerp(zoomControls.currentFOV, zoomedFOV, howFar);
            camera.updateProjectionMatrix();

            // Turn off the flag if done zooming
            if (howFar >= 1.0) zoomControls.zoomingIn = false;
        }
        if(zoomControls.zoomingOut){
            const howFar = (now-zoomControls.zoomStartTime) / (zoomDuration * 1000); // Measuring how far along we are %-wise

            // Linear interpolation from zoomed in to zoomed out
            camera.fov = THREE.MathUtils.lerp(zoomControls.currentFOV, originalFOV, howFar);
            camera.updateProjectionMatrix();

            // Turn off the flag if done zooming
            if (howFar >= 1.0) zoomControls.zoomingOut = false;
        }


        updatePhysics(delta, camera, controls);
    }

    
    /* Rotate the cube for some animation
    cube1.rotation.x += 0.01;
    cube1.rotation.y += 0.01;
    cube2.rotation.x += 0.01;
    cube2.rotation.y += 0.01;
    cube3.rotation.x += 0.01;
    cube3.rotation.y += 0.01;*/

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}


