import * as THREE from 'three';
import { addToScene } from './main.js';
import { spawnPos } from './player.js';
import { collidableObjects } from './physics.js';

const bots = [];

export function initBots() {
    const colors = [
        0xff4444, 0x44ff44, 0x4444ff, 0xffff44,
        0xff44ff, 0x44ffff, 0xff8844, 0x88ff44,
        0x4488ff, 0xff4488, 0x8844ff, 0x44ff88
    ];
    for (let i = 0; i < 12; i++) {
        const geo = new THREE.CylinderGeometry(0.5, 0.5, 2, 12);
        geo.computeBoundingBox();
        const mat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length] });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.position.set(
            spawnPos.x + (Math.random() - 0.5) * 80,
            1,
            spawnPos.z + (Math.random() - 0.5) * 80
        );
        mesh.velocity = new THREE.Vector3();
        addToScene(mesh);
        bots.push({ mesh, aggression: Math.random() });
        collidableObjects.push(mesh);
    }
}

export function updateBots(delta, playerPos) {
    const tmp = new THREE.Vector3();
    const proposed = new THREE.Vector3();
    for (const bot of bots) {
        tmp.copy(playerPos).sub(bot.mesh.position);
        tmp.y = 0;
        const distToPlayer = tmp.length();
        if (distToPlayer > 0.001) tmp.normalize();
        const randomDir = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        const moveDir = tmp.multiplyScalar(bot.aggression).add(randomDir.multiplyScalar(1 - bot.aggression)).normalize();

        proposed.copy(bot.mesh.position).addScaledVector(moveDir, 5 * delta);
        if (!checkCollision(bot.mesh, proposed)) {
            bot.mesh.position.copy(proposed);
        } else {
            const sideDir = new THREE.Vector3(moveDir.z, 0, -moveDir.x); // rotate 90 degrees
            proposed.copy(bot.mesh.position).addScaledVector(sideDir, 5 * delta);
            if (!checkCollision(bot.mesh, proposed)) {
                bot.mesh.position.copy(proposed);
            }
        }
    }
}

function checkCollision(mesh, newPos) {
    const botBox = mesh.geometry.boundingBox.clone();
    botBox.applyMatrix4(new THREE.Matrix4().makeTranslation(newPos.x, newPos.y, newPos.z));
    for (const obj of collidableObjects) {
        if (obj === mesh) continue;
        if (obj.userData && obj.userData.isGround) continue; // allow sliding on floor
        if (!obj.geometry || !obj.geometry.boundingBox) obj.geometry?.computeBoundingBox?.();
        if (!obj.geometry?.boundingBox) continue;
        const objBox = obj.geometry.boundingBox.clone();
        objBox.applyMatrix4(obj.matrixWorld);
        if (botBox.intersectsBox(objBox)) {
            return true;
        }
    }
    return false;
}
