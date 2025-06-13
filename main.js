// main.js

// Import Three.js
import * as THREE from 'three';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';

// Import local files
import {sceneinit} from './scene.js';
import {controlsinit, moveControls, zoomControls} from './controls.js';
import {playerinit} from './player.js';
import {physicsinit} from './physics.js';
import {environmentinit} from './environment.js';
import { originalFOV, zoomDuration, zoomedFOV } from './shootzoom.js';

// Variables

const sprintSpeed = 100.0;
const walkSpeed = 90.0;
const zoomedSpeed = 40.0;
const inAirSpeed = 8.0;

const playerSize = new THREE.Vector3(1, 2, 1);
const playerBBox = new THREE.Box3();    //Player's bounding box
const playerHeight = 2;
const spawnPos = new THREE.Vector3(0, playerHeight, 5);

const gravity = 25;
const jumpHeight = 12;
let movementSpeed = walkSpeed;
const dampingFactor = 0.18;
let damping = Math.exp(-dampingFactor);
const velocity = new THREE.Vector3();
const minimumVelocity = 0.01; // velocity will be 0 below this
const direction = new THREE.Vector3();
let worldDirection;

const clock = new THREE.Clock();
export const collidableObjects = []; // All objects I want to check collisions with


// Variables for zooming in and out

const mapIntensity = 0.1 // Set how bright the environment will affect the materials

// Variables for grabing the yaw rotation from the camera to determine movement direction
let horizontalLength;
let yaw;
let yawEuler;
let yawQuaternion;
const cameraDir = new THREE.Vector3(); // For local camera direction

// Local Classes
class Cube {
    constructor({x=0, y=2.5, z=-5, w=6, h=5, d=1} = {}){

        const cubeGeometry = new THREE.BoxGeometry(w, h, d);

        // Create the wall mesh
        this.object = new THREE.Mesh(cubeGeometry);
        this.object.castShadow = true;
        this.object.receiveShadow = true;

        // Position the wall
        this.object.position.set(x, y,z);
    }
}

// Using a wall to create our player for now
const playerModel = new Cube({x: spawnPos.x-playerSize.x/2, y: spawnPos.y-playerSize.y/2, z: spawnPos.z-playerSize.z/2, w: playerSize.x, h: playerSize.y, d:playerSize.z});



// Initialize the scene
const {scene, camera, renderer} = sceneinit(originalFOV, spawnPos);
const {controls} = controlsinit(camera, renderer);
init();
animate();

function init() {
    //Add player model to the scene
    playerModel.object.material.colorWrite = false;
    playerModel.object.material.depthWrite = false;
    playerModel.object.material.polygonOffset = true;
    //playerModel.object.material.polygonOffsetFactor = 0.1;
    //playerModel.object.material.polygonOffsetUnits = 0.4;
    scene.add(playerModel.object);
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


        if(moveControls.canJump & zoomControls.zoomedOut) movementSpeed = walkSpeed;
        if(moveControls.canJump & zoomControls.zoomedIn) movementSpeed = zoomedSpeed;

        if(moveControls.jumping) {
            moveControls.jumping = false;
            velocity.y += jumpHeight; // Adjust jump strength as needed
            moveControls.canJump = false;
            damping = 1.0; //Disable friction in mid-air
            movementSpeed = inAirSpeed;
        }

        // Apply Gravity
        velocity.y -= gravity * delta;

        // Apply Friction
        if(Math.abs(velocity.x)<minimumVelocity)
            velocity.x = 0;
        else
            velocity.x *= damping;
        if(Math.abs(velocity.z)<minimumVelocity)
            velocity.z = 0;
        else
            velocity.z *= damping;

        // Determine the direction of movement based on which keys are being pressed down
        direction.set(0, 0, 0);
        if (moveControls.moveForward) direction.z -= 1;
        if (moveControls.moveBackward) direction.z += 1;
        if (moveControls.moveLeft) direction.x -= 1;
        if (moveControls.moveRight) direction.x += 1;
        direction.normalize();

        // Transform direction by the camera's rotation into a world-space direction
        // Need to extract and use the yaw from the camera's rotation
        // Get the camera's world direction
        camera.getWorldDirection(cameraDir);

        // Project onto the horizontal plane (ignore Y)
        cameraDir.y = 0;
        //console.log(cameraDir);
        //cameraDir.normalize();

        // Compute yaw using arctangent of 2 angles. This yields an angle in the range [-PI, PI]
        yaw = Math.atan2(-cameraDir.x, -cameraDir.z);
        yawEuler = new THREE.Euler(0, yaw, 0, 'XYZ');
        yawQuaternion = new THREE.Quaternion().setFromEuler(yawEuler);
        //console.log(yawQuaternion);
        worldDirection = direction.clone().applyQuaternion(yawQuaternion);
        worldDirection.normalize();
     

        // Calculate Velocity
        velocity.x += worldDirection.x * movementSpeed * delta;
        velocity.z += worldDirection.z * movementSpeed * delta;

        // Move the camera (controls)
        controls.object.position.x += velocity.x * delta;
        controls.object.position.z += velocity.z * delta;
        controls.object.position.y += velocity.y * delta;

        // Check for Out of Bounds
        if(controls.object.position.y < -200){
            controls.object.position.x = spawnPos.x;
            controls.object.position.y = spawnPos.y;
            controls.object.position.z = spawnPos.z;
            velocity.y = 0;
            moveControls.canJump = true;
            damping = Math.exp(-dampingFactor);
            movementSpeed = walkSpeed;
        }

        // Update player model position
        playerModel.object.position.x = controls.object.position.x;
        playerModel.object.position.y = controls.object.position.y-playerSize.y/2;
        playerModel.object.position.z = controls.object.position.z;

        // Rotate the player model with the camera as long as the pitch is above a certain level
        // Compute the horizontal length of the direction vector
        horizontalLength = Math.sqrt(cameraDir.x * cameraDir.x + cameraDir.z * cameraDir.z);
        if(horizontalLength > 0.001) playerModel.object.rotation.y = yaw;

        //Update the Player's bounding box
        const playerPosition = controls.object.position;
        playerBBox.setFromCenterAndSize(
            new THREE.Vector3(playerPosition.x, playerPosition.y-playerHeight/2, playerPosition.z),
            playerSize
        );

        // Check for collisions
        checkCollisions();
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

function checkCollisions() {

    for (let object of collidableObjects) {

        // Update the object's bounding box to world coordinates
        object.geometry.computeBoundingBox();
        const objectBBox = object.geometry.boundingBox.clone();
        objectBBox.expandByScalar(0.1);
        objectBBox.applyMatrix4(object.matrixWorld);

        // Check for intersection with the player's bounding box
        if (playerBBox.intersectsBox(objectBBox)) {
            // Collision detected
            resolveCollision(objectBBox);
        }
    }
}

function resolveCollision(objectBBox) {
    // Calculate the overlap between the player's bounding box and the object's bounding box
    const overlap = new THREE.Vector3();
    playerBBox.getCenter(overlap).sub(objectBBox.getCenter(new THREE.Vector3()));
    overlap.x = (playerSize.x / 2 + (objectBBox.max.x - objectBBox.min.x) / 2) - Math.abs(overlap.x);
    overlap.y = (playerSize.y / 2 + (objectBBox.max.y - objectBBox.min.y) / 2) - Math.abs(overlap.y);
    overlap.z = (playerSize.z / 2 + (objectBBox.max.z - objectBBox.min.z) / 2) - Math.abs(overlap.z);

    // Find the axis with the smallest overlap to resolve the collision
    if (overlap.x < overlap.y && overlap.x < overlap.z) {
        // Resolve in x-axis
        if (controls.object.position.x > objectBBox.getCenter(new THREE.Vector3()).x) {
            controls.object.position.x += (overlap.x);
        } else {
            controls.object.position.x -= (overlap.x);
        }
        velocity.x = 0;
    } else if (overlap.y < overlap.x && overlap.y < overlap.z) {
        // Resolve in y-axis
        if (controls.object.position.y > objectBBox.getCenter(new THREE.Vector3()).y) {
            controls.object.position.y += (overlap.y);
            velocity.y = 0;
            moveControls.canJump = true;
            damping = Math.exp(-dampingFactor);
            //movementSpeed = walkSpeed;
        } else {
            controls.object.position.y -= (overlap.y);
            velocity.y = 0;
        }
    } else {
        // Resolve in z-axis
        if (controls.object.position.z > objectBBox.getCenter(new THREE.Vector3()).z) {
            controls.object.position.z += (overlap.z);
        } else {
            controls.object.position.z -= (overlap.z);
        }
        velocity.z = 0;
    }
}

