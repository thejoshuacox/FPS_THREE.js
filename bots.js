import * as THREE from 'three';
import { addToScene } from './main.js';
import { spawnPos } from './player.js';

const bots = [];

export function initBots() {
    const colors = [
        0xff0000, 0x00ff00, 0x0000ff, 0xffff00,
        0xff00ff, 0x00ffff, 0xff8800, 0x88ff00,
        0x0088ff, 0xff0088, 0x8800ff, 0x00ff88
    ];
    for (let i = 0; i < 12; i++) {
        const geo = new THREE.CylinderGeometry(0.5, 0.5, 2, 12);
        const mat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length] });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.position.set(
            spawnPos.x + (Math.random() - 0.5) * 80,
            1,
            spawnPos.z + (Math.random() - 0.5) * 80
        );
        addToScene(mesh);
        bots.push({ mesh, aggression: Math.random() });
    }
}

export function updateBots(delta, playerPos) {
    const tmp = new THREE.Vector3();
    for (const bot of bots) {
        tmp.copy(playerPos).sub(bot.mesh.position);
        tmp.y = 0;
        const distToPlayer = tmp.length();
        if (distToPlayer > 0.001) tmp.normalize();
        const randomDir = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        tmp.multiplyScalar(bot.aggression).add(randomDir.multiplyScalar(1 - bot.aggression)).normalize();
        bot.mesh.position.addScaledVector(tmp, 5 * delta);
    }
}
