// Import Three.js
import * as THREE from 'three';
import { moveControls, zoomControls } from './controls.js';
import { playerSize, playerBBox, playerHeight, playerModel, spawnPos } from './player.js';

// Objects to test collisions against
export const collidableObjects = [];

// Movement/physics constants
const sprintSpeed = 100.0;
const walkSpeed = 90.0;
const zoomedSpeed = 40.0;
const inAirSpeed = 8.0;

const gravity = 25;
const jumpHeight = 12;
let movementSpeed = walkSpeed;
const dampingFactor = 0.18;
let damping = Math.exp(-dampingFactor);
const velocity = new THREE.Vector3();
const minimumVelocity = 0.01; // velocity will be 0 below this
const direction = new THREE.Vector3();
const cameraDir = new THREE.Vector3();
let yaw;
let yawEuler;
let yawQuaternion;

// Update physics and collisions each frame
export function updatePhysics(delta, camera, controls) {
    if (moveControls.canJump && zoomControls.zoomedOut) movementSpeed = walkSpeed;
    if (moveControls.canJump && zoomControls.zoomedIn) movementSpeed = zoomedSpeed;

    if (moveControls.jumping) {
        moveControls.jumping = false;
        velocity.y += jumpHeight;
        moveControls.canJump = false;
        damping = 1.0; // Disable friction while in the air
        movementSpeed = inAirSpeed;
    }

    // Apply gravity
    velocity.y -= gravity * delta;

    // Apply friction
    if (Math.abs(velocity.x) < minimumVelocity) velocity.x = 0; else velocity.x *= damping;
    if (Math.abs(velocity.z) < minimumVelocity) velocity.z = 0; else velocity.z *= damping;

    // Determine movement direction from keys
    direction.set(0, 0, 0);
    if (moveControls.moveForward) direction.z -= 1;
    if (moveControls.moveBackward) direction.z += 1;
    if (moveControls.moveLeft) direction.x -= 1;
    if (moveControls.moveRight) direction.x += 1;
    direction.normalize();

    // Transform direction by camera yaw
    camera.getWorldDirection(cameraDir);
    cameraDir.y = 0;
    yaw = Math.atan2(-cameraDir.x, -cameraDir.z);
    yawEuler = new THREE.Euler(0, yaw, 0, 'XYZ');
    yawQuaternion = new THREE.Quaternion().setFromEuler(yawEuler);
    const worldDirection = direction.clone().applyQuaternion(yawQuaternion).normalize();

    // Calculate velocity
    velocity.x += worldDirection.x * movementSpeed * delta;
    velocity.z += worldDirection.z * movementSpeed * delta;

    // Move the camera
    controls.object.position.x += velocity.x * delta;
    controls.object.position.z += velocity.z * delta;
    controls.object.position.y += velocity.y * delta;

    // Reset if out of bounds
    if (controls.object.position.y < -200) {
        controls.object.position.x = spawnPos.x;
        controls.object.position.y = spawnPos.y;
        controls.object.position.z = spawnPos.z;
        velocity.y = 0;
        moveControls.canJump = true;
        damping = Math.exp(-dampingFactor);
        movementSpeed = walkSpeed;
    }

    // Update player model position and rotation
    playerModel.object.position.x = controls.object.position.x;
    playerModel.object.position.y = controls.object.position.y - playerSize.y / 2;
    playerModel.object.position.z = controls.object.position.z;
    const horizontalLength = Math.sqrt(cameraDir.x * cameraDir.x + cameraDir.z * cameraDir.z);
    if (horizontalLength > 0.001) playerModel.object.rotation.y = yaw;

    // Update player bounding box
    const playerPosition = controls.object.position;
    playerBBox.setFromCenterAndSize(
        new THREE.Vector3(playerPosition.x, playerPosition.y - playerHeight / 2, playerPosition.z),
        playerSize
    );

    // Check collisions
    checkCollisions(controls);
}

function checkCollisions(controls) {
    for (let object of collidableObjects) {
        object.geometry.computeBoundingBox();
        const objectBBox = object.geometry.boundingBox.clone();
        objectBBox.expandByScalar(0.1);
        objectBBox.applyMatrix4(object.matrixWorld);
        if (playerBBox.intersectsBox(objectBBox)) {
            resolveCollision(objectBBox, controls);
        }
    }
}

function resolveCollision(objectBBox, controls) {
    const overlap = new THREE.Vector3();
    playerBBox.getCenter(overlap).sub(objectBBox.getCenter(new THREE.Vector3()));
    overlap.x = (playerSize.x / 2 + (objectBBox.max.x - objectBBox.min.x) / 2) - Math.abs(overlap.x);
    overlap.y = (playerSize.y / 2 + (objectBBox.max.y - objectBBox.min.y) / 2) - Math.abs(overlap.y);
    overlap.z = (playerSize.z / 2 + (objectBBox.max.z - objectBBox.min.z) / 2) - Math.abs(overlap.z);

    if (overlap.x < overlap.y && overlap.x < overlap.z) {
        if (controls.object.position.x > objectBBox.getCenter(new THREE.Vector3()).x) {
            controls.object.position.x += overlap.x;
        } else {
            controls.object.position.x -= overlap.x;
        }
        velocity.x = 0;
    } else if (overlap.y < overlap.x && overlap.y < overlap.z) {
        if (controls.object.position.y > objectBBox.getCenter(new THREE.Vector3()).y) {
            controls.object.position.y += overlap.y;
            velocity.y = 0;
            moveControls.canJump = true;
            damping = Math.exp(-dampingFactor);
        } else {
            controls.object.position.y -= overlap.y;
            velocity.y = 0;
        }
    } else {
        if (controls.object.position.z > objectBBox.getCenter(new THREE.Vector3()).z) {
            controls.object.position.z += overlap.z;
        } else {
            controls.object.position.z -= overlap.z;
        }
        velocity.z = 0;
    }
}
