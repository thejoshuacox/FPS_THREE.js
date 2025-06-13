// Import Three.js
import * as THREE from 'three';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';

// All code related to creating and configuring the Three.js scene, camera, renderer, lights, and asset loading
export function sceneinit(originalFOV, spawnPos) {
    // Create the scene
        const scene = new THREE.Scene();
        //scene.background = new THREE.Color(0x90c0f0); // Set a neutral background color
    
        // Set up the camera
        const camera = new THREE.PerspectiveCamera(
            originalFOV, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.05, // Near clipping plane
            10000 // Far clipping plane
        );
        camera.position.set(spawnPos.x, spawnPos.y, spawnPos.z); // Move camera to the spawn position
    
        // Set up the renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);
    
        // Tone mapping for HDR
        renderer.toneMapping = THREE.NeutralToneMapping;
        renderer.toneMappingExposure = 1;
        renderer.outputEncoding = THREE.sRGBEncoding;
    
        // PMREM Generator (Environment Map)
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
    
        //Load the HDR file for the environment using RGBELoader
        new RGBELoader()
        .load('Textures/sky-darkened2.hdr', (texture) => {
    
            // Convert the loaded HDR equirect to a cubemap
            const hdrEquirect = pmremGenerator.fromEquirectangular(texture);
            
            // The 'hdrEquirect.texture' is now a pre-filtered cubemap suitable as a scene's environment
            scene.environment = hdrEquirect.texture;  // For PBR materials’ reflections
    
            // We can dispose of the original equirect texture if we want
            texture.dispose();
    
        }, undefined, (error) => {
            console.error('An error occurred while loading the HDR:', error);
        });
    
        //Load the HDR file for the background using RGBELoader
        new RGBELoader()
        .load('Textures/Mountains.hdr', (texture) => {
    
            // Convert the loaded HDR equirect to a cubemap
            const hdrEquirect = pmremGenerator.fromEquirectangular(texture);
            
            // The 'hdrEquirect.texture' is now a pre-filtered cubemap suitable as a scene's environment
            scene.background = hdrEquirect.texture;  // For PBR materials’ reflections
    
            // We can dispose of the original equirect texture if we want
            texture.dispose();
    
        }, undefined, (error) => {
            console.error('An error occurred while loading the HDR:', error);
        });

        return {scene, camera, renderer};
}